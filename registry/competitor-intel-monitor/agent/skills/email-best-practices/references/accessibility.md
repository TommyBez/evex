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
    <title>Competitor intel digest — 2026-09-07</title>
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

One `<h1>` names the digest ("Competitor intel digest — 2026-09-07"). Each changed URL
can be an `<h2>` if you expand beyond the default table. Never skip levels or fake a
heading with bold `<p>`.

### Every link must have discernible text

Every `<a>` must contain text a screen reader can announce. Use the watched URL as the
link text, not "click here".

```html
<!-- Wrong -->
<a href="https://example.com/pricing">click here</a>

<!-- Right -->
<a href="https://example.com/pricing">https://example.com/pricing</a>
```

### Include a `<title>` tag

Many clients and assistive technologies read `<title>` before anything else. Treat it
like the subject line, not the brand name.

### Color contrast and dark mode

- Body text and links: 4.5:1 minimum against the background (WCAG AA).
- Never rely on color alone to convey meaning.

## Authoring checklist

- [ ] `<html>` has `lang` and `dir`; direct children of `<body>` also have `lang` and `dir`
- [ ] `<title>` is set and specific to this digest
- [ ] Layout `<table>` elements have `role="presentation"`
- [ ] One `<h1>`; headings nested in order
- [ ] Every `<a>` has discernible text that describes its destination
- [ ] A plain-text alternative is sent alongside the HTML

## Related

- [Sending Reliability](./sending-reliability.md) — idempotent sends and error handling
