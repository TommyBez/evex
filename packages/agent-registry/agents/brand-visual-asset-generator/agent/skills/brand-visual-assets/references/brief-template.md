# Per-asset brief template

Include every field in each `svg-generator` message:

| Field | Value |
| --- | --- |
| `assetType` | `icon` \| `empty-state` \| `hero` \| `badge` \| `feature-graphic` \| `onboarding` \| `changelog` \| `dashboard-modal` |
| `filename` | kebab-case ending in `.svg` |
| `purpose` | one sentence on where it ships |
| `dimensions` | viewBox or aspect ratio (for example `1200x630` hero, `24x24` icon) |
| `palette` | named colors with hex from the locked brand profile |
| `subject` | what to depict |
| `text` | exact copy if the SVG includes text |
| `styleNotes` | stroke weight, corner radius, illustration density, metaphors to use or avoid |
| `constraints` | for example `currentColor`, no gradients, dark-mode safe |
