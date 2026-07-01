---
name: brand-visual-assets
description: Scope and ship a brand-aligned pack of SVG assets for SaaS products. Use when the user wants a visual pack, feature launch assets, icons, empty states, hero illustrations, badges, feature graphics, onboarding visuals, changelog art, or dashboard/modal graphics.
---

# Pack workflow

Run these steps in order. A **pack** is one coherent set of SVG assets that share
palette, stroke language, and illustration metaphors.

## 1. Scope the pack

List every asset the run will produce: type, filename, purpose, and channel
(marketing page, in-app empty state, onboarding, and so on).

**Done when:** every requested asset has a named slot; no orphan types remain.

If the user gave no item list, load `references/default-pack.md` and adopt that
pack unless they named specific types or channels.

## 2. Lock the brand profile

Capture the palette and tone the pack will obey — from Context.dev output or the
user's explicit brand profile.

**Done when:** primary and secondary hex colors, neutral/background tones,
typography personality, logo constraints, product category, audience, and tone
adjectives are all recorded before any brief is written.

## 3. Write a brief per asset

For each pack slot, compose one self-contained **brief** for `svg-generator`.

**Done when:** every slot has a brief containing every field in
`references/brief-template.md`.

## 4. Delegate

Call `svg-generator` once per brief. Pass the full brief in `message`; the
subagent does not see parent history.

**Done when:** every brief has a matching `svg-generator` call; independent assets
(for example three icons) are delegated in parallel when possible.

## 5. Hunt drift

Compare returned SVGs against the locked brand profile and pack consistency
rules.

**Done when:** every asset passes `references/quality-bar.md`; any asset that
**drifts** (off-palette color, mismatched stroke language, or broken metaphor) is
regenerated individually with a tighter brief — not the whole pack unless the
brand profile changed.
