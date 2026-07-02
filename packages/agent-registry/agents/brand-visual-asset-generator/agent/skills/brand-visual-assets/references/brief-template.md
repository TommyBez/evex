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
| `tasteNotes` | what should make the asset feel sharp, premium, and brand-specific |
| `constraints` | for example `currentColor`, no gradients, dark-mode safe |

Every brief must include at least one negative constraint, such as "avoid generic
globe/network art", "avoid repeated decorative dot grids", or "avoid stock SaaS
dashboard cards". Negative constraints prevent the SVG subagent from falling back
to obvious visual clichés.
