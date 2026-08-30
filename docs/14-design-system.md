# King's Edge design system

## Purpose

The mobilisation plan should feel like one product. Styling is therefore organised around a small shared visual grammar rather than page-specific reinvention.

The canonical implementation lives in `src/design-system.css`.

## Design grammar

King's Edge uses:

- King's Bureau Grot for display and section-heading typography;
- Arial for body copy and operational UI;
- black and white as the structural palette;
- King's red as the primary accent and attention colour;
- square geometry rather than rounded cards or pills;
- rules, spacing and hierarchy rather than decorative shadows;
- soft neutral surfaces for supporting information;
- compact labels for references, statuses and metadata;
- restrained interaction states that normally move from black/white to King's red.

## Styling ownership

### `src/design-system.css`

Owns shared tokens and primitives:

- colour and typography tokens;
- spacing and geometry;
- page container;
- stack, cluster and responsive grid layouts;
- panels and cards;
- display and section headings;
- eyebrows and reference labels;
- controls and buttons;
- compact tags;
- callouts;
- metric cards;
- table grammar.

Existing selectors are temporarily aliased into these primitives where doing so lets current pages adopt the shared grammar without a large JSX rewrite.

### `src/styles.css`

Owns site compositions that are genuinely specific to the mobilisation-plan interface, for example:

- global navigation layout;
- hero composition;
- project board;
- deliverable board;
- dependency lens;
- timeline composition;
- print layout.

It should not redefine tokens or duplicate the base styling of panels, controls, labels or tags.

### Feature stylesheets

Feature stylesheets may define layout or states that are unique to the feature. They should consume the shared tokens and primitives rather than establish a parallel visual system.

## Rules for new work

1. Start by composing an existing primitive.
2. If a treatment is genuinely reusable, add a primitive or a documented variant in `design-system.css`.
3. Keep page selectors concerned with composition and placement, not restating shared appearance.
4. Avoid raw colour values outside the design system unless the value is intrinsic to a visualisation or print requirement.
5. Avoid `!important`. Where it is currently required to defeat legacy cascade rules, treat it as migration debt and remove the conflicting legacy rule rather than adding another override.
6. Do not add new late-loaded override stylesheets to `index.html`.
7. Prefer one content gutter, one border rule and one hierarchy per section. Avoid nested boxes unless the information architecture genuinely requires them.
8. A new visual treatment should normally be a shared primitive or a legitimate variant, not a one-off selector chain.

## Migration priority

The current migration order is:

1. establish canonical tokens and shared primitives;
2. remove duplicated base declarations from `src/styles.css`;
3. migrate the deliverable and project detail grammar onto shared primitives;
4. absorb the Resources & Investment cascade bridge into the canonical component styling and remove the bridge;
5. retire obsolete rules from `src/styles/legacy-public.css` feature by feature;
6. remove remaining late-loaded presentation overrides once their owning stylesheets are clean.

The aim is progressive retirement of legacy CSS rather than a risky whole-site rewrite.
