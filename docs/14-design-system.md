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

Feature stylesheets define layouts or states that are unique to a feature and consume shared tokens rather than establish a parallel visual system.

Current owned feature styles include:

- `src/styles/resource-profile.css` for Resources & Investment;
- `src/styles/project-overview.css` for project overview/detail presentation;
- `src/styles/timeline.css` for the operational timeline.

`src/site-entry.jsx` loads the normal application first, then the small set of source-owned styles that still need to follow the legacy compatibility bundle while historical declarations are retired. This is an explicit migration boundary, not a general override mechanism.

`src/styles/post-legacy-cleanup.css` is deliberately narrow. It contains only cross-site presentation clean-ups that still need to follow the legacy bundle. Build validation caps both its size and its use of `!important`.

### Legacy compatibility

`src/styles/legacy-public-source.css` preserves the historical stylesheet while migration is in progress. It is not imported by the application.

`src/styles/legacy-public.css` is generated before development and production builds by `scripts/prepare-legacy-styles.mjs`. The generator removes selector families that have moved to canonical feature styles before the compatibility bundle enters the runtime cascade.

Project overview migration currently removes 101 historical project selector occurrences across 83 fully retired rules. Build validation checks that the retired project selectors cannot reappear in the generated compatibility CSS.

This generated-bundle approach is transitional. Each migrated feature should reduce the preserved source until the compatibility layer can be removed completely.

## Rules for new work

1. Start by composing an existing primitive.
2. If a treatment is genuinely reusable, add a primitive or a documented variant in `design-system.css`.
3. Keep page selectors concerned with composition and placement, not restating shared appearance.
4. Avoid raw colour values outside the design system unless the value is intrinsic to a visualisation or print requirement.
5. Avoid `!important`. Where it is currently required to defeat generic legacy cascade rules, treat it as migration debt and retire the conflicting legacy rule rather than adding another override.
6. Do not add new late-loaded override stylesheets to `index.html`.
7. Prefer one content gutter, one border rule and one hierarchy per section. Avoid nested boxes unless the information architecture genuinely requires them.
8. A new visual treatment should normally be a shared primitive or a legitimate variant, not a one-off selector chain.
9. Source-owned feature styles may temporarily follow `legacy-public.css` only through the documented `site-entry.jsx` migration boundary and must remain within the validator budgets.
10. Do not edit generated `legacy-public.css` as the source of truth. Historical migration work belongs in `legacy-public-source.css` and the generator retirement list.

## Migration status and priority

Completed:

1. canonical tokens and shared primitives established;
2. duplicated base declarations removed from `src/styles.css`;
3. Resources & Investment moved into its canonical component stylesheet, with the former spacing bridge deleted;
4. project overview presentation moved out of `public/project-detail-refresh.css` and into source-owned feature styling;
5. the late public project refresh file deleted;
6. project overview and deliverable-board selector families removed from the runtime legacy bundle before build;
7. project overview `!important` debt reduced to two declarations, both caused by the still-generic deliverable `.detail-summary` legacy rule.

Next:

1. migrate the deliverable-detail grammar so the remaining generic `.detail-summary` conflict can be retired and the project overview `!important` count can reach zero;
2. delete `src/styles/post-legacy-cleanup.css` once its small compatibility responsibilities have moved into their owning stylesheets;
3. repeat the generated-retirement process for timeline and Theory of Change presentation;
4. progressively shrink `legacy-public-source.css` as each retired feature family becomes safe to delete permanently;
5. delete the legacy compatibility system once no live feature depends on it.

The aim is progressive retirement of legacy CSS rather than a risky whole-site rewrite.
