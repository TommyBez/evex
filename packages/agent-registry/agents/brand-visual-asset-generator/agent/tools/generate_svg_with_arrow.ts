import { generateImage, NoImageGeneratedError } from "ai";
import { defineTool } from "eve/tools";
import { z } from "zod";

const ARROW_MODEL = "quiverai/arrow-1.1";
const RESPONSE_PREVIEW_LENGTH = 1200;

const inputSchema = z.object({
  filename: z
    .string()
    .min(1)
    .describe("Suggested SVG filename, for example feature-hero.svg."),
  assetType: z
    .string()
    .min(1)
    .describe("Asset type, for example hero illustration, icon, badge, or empty state."),
  brief: z
    .string()
    .min(20)
    .describe("Self-contained creative brief with brand profile, subject, style notes, and constraints."),
  dimensions: z
    .string()
    .min(1)
    .describe("Intended dimensions or viewBox, for example 1200x720 or 0 0 64 64."),
});

type GenerateSvgOutput =
  | {
      byteLength: number;
      filename: string;
      mediaType: "image/svg+xml";
      model: typeof ARROW_MODEL;
      ok: true;
      revisedPrompt?: string;
      svg: string;
    }
  | {
      error: string;
      filename: string;
      missingEnv?: "AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN";
      ok: false;
      responsePreview?: string;
      status?: number;
    };

export default defineTool({
  description:
    "Generate one editable SVG asset by calling the Quiver Arrow image model through Vercel AI Gateway. Use once per finalized asset brief.",
  inputSchema,
  async execute(input): Promise<GenerateSvgOutput> {
    const credential = readGatewayCredential();
    if (!credential) {
      return {
        ok: false,
        filename: input.filename,
        error:
          "AI Gateway credentials are required to call quiverai/arrow-1.1. Set AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN.",
        missingEnv: "AI_GATEWAY_API_KEY or VERCEL_OIDC_TOKEN",
      };
    }

    const prompt = buildPrompt(input);
    const generatedSvg = await generateSvgWithGateway(prompt);
    if (!generatedSvg.ok) {
      return {
        ok: false,
        filename: input.filename,
        error: generatedSvg.error,
        responsePreview: generatedSvg.responsePreview,
      };
    }

    const rawSvg = generatedSvg.svg;
    if (!looksLikeSvg(rawSvg)) {
      return {
        ok: false,
        filename: input.filename,
        error: "Quiver Arrow returned data that does not look like SVG markup.",
        responsePreview: preview(rawSvg),
      };
    }

    if (!hasViewBox(rawSvg)) {
      return {
        ok: false,
        filename: input.filename,
        error: "Quiver Arrow returned SVG markup without a viewBox.",
        responsePreview: preview(rawSvg),
      };
    }

    const normalizedSvg = normalizeViewBox(rawSvg, input);
    const themeableSvg = enforceThemeableIconSvg(normalizedSvg, input);
    const svg = ensureAccessibleSvg(themeableSvg, input);
    return {
      ok: true,
      filename: input.filename,
      model: ARROW_MODEL,
      mediaType: "image/svg+xml",
      byteLength: Buffer.byteLength(svg, "utf8"),
      svg,
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: output,
    };
  },
});

function readGatewayCredential(): string | undefined {
  return (
    process.env.AI_GATEWAY_API_KEY?.trim() ||
    process.env.VERCEL_OIDC_TOKEN?.trim()
  );
}

function buildPrompt(input: z.infer<typeof inputSchema>): string {
  return [
    `Generate ${input.filename} as a production-ready SVG.`,
    `Asset type: ${input.assetType}.`,
    `Dimensions or viewBox: ${input.dimensions}.`,
    "",
    input.brief,
    "",
    "Hard requirements:",
    "- Return complete SVG markup only.",
    "- Include a viewBox, title, and desc.",
    "- Use semantic group ids for meaningful sections.",
    "- Keep the artwork editable. Do not embed raster images.",
    "- For icons, use currentColor for all strokes and only one fixed accent fill when needed.",
    "- Avoid generic SaaS filler such as globes, random node networks, decorative dot grids, and disconnected floating dashboards.",
  ].join("\n");
}

async function generateSvgWithGateway(
  prompt: string,
): Promise<{ ok: true; svg: string } | { error: string; ok: false; responsePreview?: string }> {
  try {
    const { image } = await generateImage({
      model: ARROW_MODEL,
      prompt,
      n: 1,
      providerOptions: {
        quiverai: {
          operation: "generate",
          instructions:
            "Return a complete SVG document only. The SVG must be editable markup, not raster data.",
          maxOutputTokens: 6000,
          temperature: 0.45,
          topP: 0.9,
        },
      },
    });

    return {
      ok: true,
      svg: new TextDecoder().decode(image.uint8Array).trim(),
    };
  } catch (error) {
    if (NoImageGeneratedError.isInstance(error)) {
      return {
        ok: false,
        error: "AI Gateway did not return SVG image data.",
        responsePreview: preview(String(error.cause ?? error.message)),
      };
    }

    return {
      ok: false,
      error: "Quiver Arrow SVG generation failed through AI Gateway.",
      responsePreview: preview(errorMessage(error)),
    };
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function looksLikeSvg(value: string): boolean {
  return value.includes("<svg") && value.includes("</svg>");
}

function hasViewBox(value: string): boolean {
  return /\sviewBox\s*=/iu.test(value);
}

type ViewBox = {
  height: number;
  minX: number;
  minY: number;
  width: number;
};

function normalizeViewBox(
  svg: string,
  input: z.infer<typeof inputSchema>,
): string {
  const targetViewBox = parseTargetViewBox(input.dimensions);
  const sourceViewBox = parseSvgViewBox(svg);

  if (!targetViewBox || !sourceViewBox || sameViewBox(sourceViewBox, targetViewBox)) {
    return svg;
  }

  const innerSvg = extractInnerSvg(svg);
  if (!innerSvg) {
    return svg;
  }

  const scale = Math.min(
    targetViewBox.width / sourceViewBox.width,
    targetViewBox.height / sourceViewBox.height,
  );
  const scaledWidth = sourceViewBox.width * scale;
  const scaledHeight = sourceViewBox.height * scale;
  const translateX =
    targetViewBox.minX +
    (targetViewBox.width - scaledWidth) / 2 -
    sourceViewBox.minX * scale;
  const translateY =
    targetViewBox.minY +
    (targetViewBox.height - scaledHeight) / 2 -
    sourceViewBox.minY * scale;
  const transform = `translate(${formatNumber(translateX)} ${formatNumber(translateY)}) scale(${formatNumber(scale)})`;
  const outerTag = buildSvgOpeningTag(svg, targetViewBox);

  return `${outerTag}\n<g id="arrow-generated-artwork" transform="${transform}">\n${innerSvg.trim()}\n</g>\n</svg>`;
}

function parseTargetViewBox(value: string): ViewBox | undefined {
  const viewBoxParts = value
    .trim()
    .split(/\s+/u)
    .map((part) => Number(part));

  if (viewBoxParts.length === 4 && viewBoxParts.every(Number.isFinite)) {
    const [minX, minY, width, height] = viewBoxParts;
    if (width > 0 && height > 0) {
      return { height, minX, minY, width };
    }
  }

  const sizeMatch = /^(?<width>\d+(?:\.\d+)?)x(?<height>\d+(?:\.\d+)?)$/iu.exec(
    value.trim(),
  );
  if (!sizeMatch?.groups) {
    return undefined;
  }

  const width = Number(sizeMatch.groups.width);
  const height = Number(sizeMatch.groups.height);
  if (!(width > 0 && height > 0)) {
    return undefined;
  }

  return { height, minX: 0, minY: 0, width };
}

function parseSvgViewBox(svg: string): ViewBox | undefined {
  const match = /\sviewBox\s*=\s*["']([^"']+)["']/iu.exec(svg);
  if (!match?.[1]) {
    return undefined;
  }

  return parseTargetViewBox(match[1]);
}

function sameViewBox(left: ViewBox, right: ViewBox): boolean {
  return (
    left.minX === right.minX &&
    left.minY === right.minY &&
    left.width === right.width &&
    left.height === right.height
  );
}

function extractInnerSvg(svg: string): string | undefined {
  const match = /<svg\b[^>]*>([\s\S]*?)<\/svg>/iu.exec(svg);
  return match?.[1];
}

function buildSvgOpeningTag(svg: string, viewBox: ViewBox): string {
  const openingMatch = /<svg\b[^>]*>/iu.exec(svg);
  const openingTag = openingMatch?.[0] ?? '<svg xmlns="http://www.w3.org/2000/svg">';
  const withoutSizing = openingTag
    .replace(/\sviewBox\s*=\s*["'][^"']*["']/iu, "")
    .replace(/\s(width|height)\s*=\s*["'][^"']*["']/giu, "");

  return withoutSizing.replace(
    /<svg\b/iu,
    `<svg viewBox="${formatViewBox(viewBox)}"`,
  );
}

function formatViewBox(viewBox: ViewBox): string {
  return [
    formatNumber(viewBox.minX),
    formatNumber(viewBox.minY),
    formatNumber(viewBox.width),
    formatNumber(viewBox.height),
  ].join(" ");
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString();
}

function ensureAccessibleSvg(
  svg: string,
  input: z.infer<typeof inputSchema>,
): string {
  const additions: string[] = [];

  if (!/<title\b/iu.test(svg)) {
    additions.push(`<title>${escapeXml(svgTitle(input.filename))}</title>`);
  }

  if (!/<desc\b/iu.test(svg)) {
    additions.push(`<desc>${escapeXml(svgDescription(input))}</desc>`);
  }

  if (additions.length === 0) {
    return svg;
  }

  return svg.replace(/<svg\b[^>]*>/iu, (openingTag) =>
    [openingTag, ...additions].join("\n"),
  );
}

function enforceThemeableIconSvg(
  svg: string,
  input: z.infer<typeof inputSchema>,
): string {
  if (!isIconAsset(input)) {
    return svg;
  }

  return addIconRootDefaults(
    addStrokeToUnstyledIconPaths(
      svg
        .replace(/\bstroke\s*:\s*#[0-9a-f]{3,8}\b/giu, "stroke:currentColor")
        .replace(/\bstroke\s*=\s*(["'])#[0-9a-f]{3,8}\b\1/giu, 'stroke="currentColor"')
        .replace(/\bfill\s*:\s*url\([^)]*\)/giu, "fill:none")
        .replace(/\bfill\s*=\s*(["'])url\([^)]*\)\1/giu, 'fill="none"')
        .replace(/\bfill\s*:\s*(#[0-9a-f]{3,8})\b/giu, (_, color: string) =>
          isAccentColor(color) ? "fill:#7170ff" : "fill:none",
        )
        .replace(/\bfill\s*=\s*(["'])(#[0-9a-f]{3,8})\b\1/giu, (_, quote: string, color: string) =>
          isAccentColor(color) ? `fill=${quote}#7170ff${quote}` : `fill=${quote}none${quote}`,
        ),
    ),
  );
}

function isIconAsset(input: z.infer<typeof inputSchema>): boolean {
  const targetViewBox = parseTargetViewBox(input.dimensions);
  const isSmallViewBox =
    targetViewBox !== undefined &&
    targetViewBox.width <= 64 &&
    targetViewBox.height <= 64;

  return /\bicon\b/iu.test(input.assetType) || isSmallViewBox;
}

function addIconRootDefaults(svg: string): string {
  return svg.replace(/<svg\b([^>]*)>/iu, (openingTag: string, attributes: string) => {
    const withFill = /\sfill\s*=/iu.test(attributes)
      ? openingTag
      : openingTag.replace(/>$/u, ' fill="none">');
    return /\scolor\s*=/iu.test(attributes)
      ? withFill
      : withFill.replace(/>$/u, ' color="currentColor">');
  });
}

function addStrokeToUnstyledIconPaths(svg: string): string {
  return svg.replace(/<path\b([^>]*)>/giu, (tag: string, attributes: string) => {
    const hasVisualStyle = /\s(class|fill|stroke)\s*=/iu.test(attributes);
    if (hasVisualStyle) {
      return tag;
    }

    return tag.replace(
      /<path\b/iu,
      '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
    );
  });
}

function isAccentColor(color: string): boolean {
  const rgb = parseHexColor(color);
  if (!rgb) {
    return false;
  }

  const linearAccent = { blue: 255, green: 112, red: 113 };
  const distance = Math.hypot(
    rgb.red - linearAccent.red,
    rgb.green - linearAccent.green,
    rgb.blue - linearAccent.blue,
  );

  return distance <= 90;
}

function parseHexColor(
  color: string,
): { blue: number; green: number; red: number } | undefined {
  const normalized = color.replace(/^#/u, "");
  if (normalized.length === 3) {
    const [red, green, blue] = normalized.split("").map((part) => part + part);
    return parseRgbComponents(red, green, blue);
  }

  if (normalized.length === 6 || normalized.length === 8) {
    return parseRgbComponents(
      normalized.slice(0, 2),
      normalized.slice(2, 4),
      normalized.slice(4, 6),
    );
  }

  return undefined;
}

function parseRgbComponents(
  redHex: string | undefined,
  greenHex: string | undefined,
  blueHex: string | undefined,
): { blue: number; green: number; red: number } | undefined {
  if (!redHex || !greenHex || !blueHex) {
    return undefined;
  }

  const red = Number.parseInt(redHex, 16);
  const green = Number.parseInt(greenHex, 16);
  const blue = Number.parseInt(blueHex, 16);
  if (![red, green, blue].every(Number.isFinite)) {
    return undefined;
  }

  return { blue, green, red };
}

function svgTitle(filename: string): string {
  return filename
    .replace(/\.svg$/iu, "")
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function svgDescription(input: z.infer<typeof inputSchema>): string {
  return `Brand-aligned ${input.assetType} for ${input.filename}.`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function preview(value: string): string {
  if (value.length <= RESPONSE_PREVIEW_LENGTH) {
    return value;
  }

  return value.slice(0, RESPONSE_PREVIEW_LENGTH);
}
