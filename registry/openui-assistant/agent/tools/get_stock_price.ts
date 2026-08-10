import { defineTool } from "eve/tools";
import { z } from "zod";

const knownPrices: Record<string, number> = {
  AAPL: 189.84,
  AMZN: 178.25,
  GOOGL: 141.8,
  META: 485.58,
  MSFT: 378.91,
  NVDA: 875.28,
  TSLA: 248.42,
};

const getStockPriceInput = z.object({
  symbol: z
    .string()
    .min(1)
    .describe("Ticker symbol, for example AAPL or NVDA"),
});

export type GetStockPriceInput = z.infer<typeof getStockPriceInput>;

export type GetStockPriceOutput = {
  change: number;
  change_percent: number;
  day_high: number;
  day_low: number;
  price: number;
  symbol: string;
  volume: string;
};

function resolveBasePrice(symbol: string): number {
  const known = knownPrices[symbol];

  if (known !== undefined) {
    return known;
  }

  let hash = 0;

  for (const character of symbol) {
    hash = (hash + character.charCodeAt(0)) % 480;
  }

  return 20 + hash;
}

export default defineTool({
  description:
    "Get the latest stock quote for a ticker symbol. Use before rendering price or market cards.",
  inputSchema: getStockPriceInput,
  execute({ symbol }): GetStockPriceOutput {
    const normalizedSymbol = symbol.trim().toUpperCase();
    const basePrice = resolveBasePrice(normalizedSymbol);
    const change = Number.parseFloat(
      ((normalizedSymbol.length % 8) - 4).toFixed(2),
    );
    const price = Number.parseFloat((basePrice + change).toFixed(2));
    const changePercent = Number.parseFloat(
      ((change / basePrice) * 100).toFixed(2),
    );
    const volumeMillions = 10 + (normalizedSymbol.length % 50);

    return {
      symbol: normalizedSymbol,
      price,
      change,
      change_percent: changePercent,
      volume: `${volumeMillions.toFixed(1)}M`,
      day_high: Number.parseFloat(
        (price + Math.abs(change) + 1.5).toFixed(2),
      ),
      day_low: Number.parseFloat(
        (price - Math.abs(change) - 1.2).toFixed(2),
      ),
    };
  },
  toModelOutput(output) {
    return {
      type: "json",
      value: output,
    };
  },
});
