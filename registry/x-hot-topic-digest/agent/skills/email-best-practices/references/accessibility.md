# Accessibility

The digest must be readable by screen readers, dark-mode clients, translation tools, and
AI clients — not just sighted readers on a default inbox. Apply these rules every time
the digest HTML is composed.

## Rules

### Set `lang` and `dir` on `<html>` and on `<body>`'s direct children

Several email clients strip these attributes from `<html>`, so duplicate them on the
body's direct children.

```html
<html lang="en" dir="ltr">
  <head>
    <title>X Hot Topic Digest — 2026-06-26</title>
  </head>
  <body>
    <div lang="en" dir="ltr">
      <!-- digest content -->
    </div>
  </body>
</html>
```

- `lang`: a BCP 47 language tag (`en`, `it`, `ja`, `ar`).
- `dir`: `ltr`, `rtl`, or `auto`.

For multi-locale digests, pass the locale through; do not hardcode `en`.

### Mark layout tables as presentational

Any `<table>` used for layout must have `role="presentation"` (or `role="none"`).
Otherwise screen readers announce "table, row 1 of N" for every layout row.

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td>...</td>
  </tr>
</table>
```

### Use a single `<h1>` and nest headings in order

One `<h1>` names the digest ("X Hot Topic Digest — 2026-06-26"). Each hot topic is an
`<h2>`; sub-sections (origin posts, research sources) are `<h3>`. Never skip levels or
fake a heading with bold `<p>`.

```html
<h1>X Hot Topic Digest — 2026-06-26</h1>
  <h2>AI SDK 5 ships with agent loops</h2>
    <h3>Origin posts</h3>
    <h3>Research sources</h3>
```

### Every link must have discernible text

Every `<a>` must contain text a screen reader can announce. X post links should use the
handle and a short snippet; Parallel source links should use the source title.

```html
<!-- Wrong -->
<a href="https://x.com/vercel/status/1700000000000000001">click here</a>
<a href="https://x.com/vercel/status/1700000000000000001">
  https://x.com/vercel/status/1700000000000000001
</a>

<!-- Right -->
<a href="https://x.com/vercel/status/1700000000000000001">
  vercel on X: We just shipped AI SDK 5 with native agent loops
</a>
```

Never use "click here", "learn more", bare URLs, or a linked image with empty alt.

### Meaningful alt text, and `alt=""` for decorative images

- Meaningful images (charts, screenshots): describe purpose and key details in context.
- Decorative images (spacers, dividers): use an explicit `alt=""` so screen readers skip
  them. Never omit the attribute entirely.
- A linked image is never decorative — its `alt` must describe the action.

### Include a `<title>` tag

Many clients and assistive technologies read `<title>` before anything else. Treat it
like the subject line, not the brand name:

```html
<title>X Hot Topic Digest — 2026-06-26</title>
```

### Color contrast and dark mode

- Body text and links: 4.5:1 minimum against the background (WCAG AA).
- Large text (≥18pt, or ≥14pt bold): 3:1 minimum.
- Never rely on color alone to convey meaning.
- Outlook and Apple Mail force dark mode; preview the digest in dark mode before sending.

## Priority order

When you cannot fix everything, fix in this order:

1. Missing or misused `alt` on images.
2. `lang`/`dir` on `<html>` and body children, `role="presentation"` on layout tables,
   links without discernible text, missing `<title>`, color contrast.
3. Non-descriptive link text ("click here").
4. Missing `<h1>`.

## Authoring checklist

- [ ] `<html>` has `lang` and `dir`; direct children of `<body>` also have `lang` and `dir`
- [ ] `<title>` is set and specific to this digest
- [ ] Layout `<table>` elements have `role="presentation"`
- [ ] One `<h1>`; `<h2>`/`<h3>` nested in order
- [ ] Every `<a>` has discernible text that describes its destination
- [ ] No "click here", bare URLs, or linked images with empty alt
- [ ] Meaningful images have descriptive `alt`; decorative images have explicit `alt=""`
- [ ] Body text passes 4.5:1 contrast and stays readable in dark mode
- [ ] A plain-text alternative is sent alongside the HTML

## Related

- [Sending Reliability](./sending-reliability.md) — idempotent sends and error handling
