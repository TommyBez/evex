# Quality bar

Reject subagent output — regenerate the individual asset — when any of these fail:

- Not valid SVG markup
- Raster embed without an approved logo URL from brand data
- Color outside the locked brand profile palette
- Invented logo, trademark, or product claim
- Missing `viewBox` on a sized graphic
- Missing `<title>` or `<desc>` when the graphic conveys meaning

Also check `references/consistency.md` before accepting the full pack.
