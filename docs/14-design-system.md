# King's Edge design system

## Purpose

The mobilisation plan should feel like one product. Styling is therefore organised around a small shared visual grammar rather than page-specific reinvention.

The canonical foundations live in `src/design-system.css`. Reusable detail-page recipes that must currently follow the generated legacy bundle live in `src/styles/detail-primitives.css` until the compatibility layer is retired.

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

Owns shared foundations:

- colour and typography tokens;
- spacing and geometry;
- page container;
- stack, cluster and responsive grid layouts;
- foundational panels and cards;
- display and section headings;
- eyebrows and reference labels;
- controls and buttons;
- compact tags;
- callouts;
- metric cards;
- table grammar.

### `src/styles/detail-primitives.css`

Owns reusable detail-surface recipes that currently need to follow the generated legacy compatibility bundle:

- editorial cards for conceptual statements;
- strategic statements for transformation claims and North Stars;
- navigational cards for objects that open into deeper detail;
- sequence cards for ordered delivery stages;
- disclosure/concertina rows.

The `.ds-*` selectors are the reusable contract. Existing feature selectors are temporarily aliased into those recipes so current markup can consume the same grammar without a JSX rewrite or page-specific override file. These aliases should disappear as markup is progressively moved onto explicit primitive classes.

### `src/styles/global-chrome.css`

Owns the shared application chrome and cross-site reading contracts that sit around content rather than inside a single feature:

- the split KING'S EDGE / MOBILISATION PLAN header identity;
- primary navigation treatment;
- page-level utility actions;
- planning-stage context strips;
- sticky-header scroll offset;
- temporary footer visibility policy;
- suppression of repeated inline indicative labels where planning stage already communicates the same state.

The header keeps the accessible `King's Edge Mobilisation Plan` anchor text in React while the established split red/white visual treatment is source-owned in global chrome. Historical `.brand` selectors are retired from the runtime compatibility bundle.

### `src/styles.css`

Owns only residual mobilisation-plan compositions that have not yet moved to a clearer source owner, for example:

- generic hero and section-heading composition outside migrated feature pages;
- residual generic component and dependency scaffolding still shared by older markup;
- the A3 print layout.

It must not own the Projects portfolio, Deliverables/Measures catalogue navigation, operational Timeline, global chrome or other feature families that already have a canonical stylesheet. It should not redefine tokens or duplicate the base styling of panels, controls, labels or tags. Historical generic declarations should continue to move to their canonical owner as the file is decomposed.

Screen presentation in `src/styles.css` must not use `!important`. The A3 `@media print` visibility isolation is the sole residual exception because it deliberately suppresses the normal application surface while printing the dedicated sheet.

### Feature stylesheets

Feature stylesheets define layouts or states that are unique to a feature and consume shared tokens and primitives rather than establish a parallel visual system.

Current owned feature styles include:

- `src/styles/landing-overview.css` for the approved homepage composition and landing navigation;
- `src/styles/index-navigation.css` for shared Deliverables/Measures catalogue navigation;
- `src/styles/measures-overview.css` for measure-specific reporting anatomy;
- `src/styles/portfolio-overview.css` for the Projects index horizontal comparative board;
- `src/styles/resource-profile.css` for Resources & Investment;
- `src/styles/deliverable-detail.css` for deliverable-detail composition and feature-specific internals;
- `src/styles/planning-detail.css` for governance, consultation history and RAID presentation;
- `src/styles/project-overview.css` for project overview/detail presentation;
- `src/styles/timeline.css` for the operational timeline;
- `src/styles/theory-of-change.css` for the editorial Theory of Change composition and its disclosure states.

`src/site-entry.jsx` loads the normal application first, then the shared recipes and source-owned feature styles that still need to follow the generated legacy compatibility bundle while historical declarations are retired. This is an explicit migration boundary, not a general override mechanism.

There are no late-loaded stylesheets in `index.html`. Any live styling must enter through the normal bundled source cascade. Compatibility is now limited to the generated legacy bundle itself rather than separate public shims or post-legacy override files.

### Legacy compatibility

`src/styles/legacy-public-source.css` preserves the historical stylesheet while migration is in progress. It is not imported by the application.

`src/styles/legacy-public.css` is a stable wrapper around a gitignored compatibility bundle generated before development and production builds by `scripts/prepare-legacy-styles.mjs`. The generator removes selector families that have moved to canonical primitives or feature styles before the compatibility bundle enters the runtime cascade.

`scripts/style-retirement-config.mjs` is the single registry of retired selector families. The generator and style validator both import it so retirement rules cannot drift between build preparation and architecture validation.

The generator now retires project overview, project deliverable-board, deliverable hero, case-for-change, benefit/evidence, delivery-sequence, disclosure, global chrome, header brand, planning-context, landing, governance, consultation, RAID, Measures, Timeline, indicative-step and obsolete Resource & Investment widget selector families. Build validation checks that retired selectors cannot reappear in the generated compatibility CSS.

Theory of Change presentation is no longer a late public shim. It is source-owned, imported through `src/site-entry.jsx`, uses the shared sequence-card primitive for the causal chain, and follows the same black/white/red disclosure grammar as the rest of the product.

This generated-bundle approach is transitional. Each migrated feature should reduce the preserved source until the compatibility layer can be removed completely.

## Landing-page composition

The homepage is an orientation surface rather than a dashboard. It establishes the King's Edge proposition, then provides four direct routes into the programme views.

The approved visual composition is source-owned in `src/styles/landing-overview.css`. Historical `.landing-main`, `.landing-hero` and `.landing-links` selectors are removed from the compatibility bundle before runtime. The page-specific suppression of the generic hero watermark also belongs here rather than in global chrome.

The current public-facing standfirst and proposition copy remain expressed through the landing stylesheet while the older `Landing` component still exposes only the programme title and purpose as authored fields. That is content-structure debt rather than a styling dependency: when the component is decomposed, those strings should move into explicit authored markup without changing the approved presentation.

## Deliverable-page composition

A deliverable page should read progressively from proposition to implementation rather than expose every planning field at equal weight.

The canonical reading sequence is:

1. hero and concise proposition;
2. Why this matters;
3. Benefits and evidence;
4. Delivery timeline;
5. Resources and investment;
6. governance;
7. decisions and consultation;
8. risks, issues and assumptions;
9. supporting planning detail where needed.

The default view is for scanning. Long authored proposition detail remains available behind progressive disclosure. Timeline cards show an outcome and a small number of key outputs by default, with full step-level decisions, resources, risks, issues and assumptions behind step detail.

Narrative order belongs in the canonical page composition layer, not in ad-hoc DOM reordering or late CSS overrides. Where wrapper markup exists only for application structure, `display: contents` may be used deliberately so child sections can participate in the page grid without inventing another visual container.

## Project-page composition

A project page is an orientation surface. It should establish the project proposition, state the transformation being pursued, then provide a clear route into the deliverables where detailed planning lives.

The default reading sequence is:

1. project hero and proposition;
2. transformation claim, where one is authored;
3. deliverables as scannable navigational cards;
4. project-level Resources and investment.

Project pages deliberately do not reproduce step-level delivery planning. Deliverable cards should provide enough title, status, summary and ownership context to support a choice, then route the reader into the canonical deliverable detail page. Project-level transformation claims use the shared strategic-statement primitive rather than another boxed panel.

## Rules for new work

1. Start by composing an existing primitive.
2. If a treatment is genuinely reusable, add or extend a documented shared primitive rather than creating a page-only lookalike.
3. Keep page selectors concerned with composition and feature-specific structure, not restating shared appearance.
4. Avoid raw colour values outside the design system unless the value is intrinsic to a visualisation or print requirement.
5. Avoid `!important`. Where it is currently required to defeat generic legacy cascade rules, treat it as migration debt and retire the conflicting legacy rule rather than adding another override.
6. Do not add stylesheet links to `index.html` or create late-loaded override files. Styling belongs in the bundled source cascade.
7. Prefer one content gutter, one border rule and one hierarchy per section. Avoid nested boxes unless the information architecture genuinely requires them.
8. A new visual treatment should normally be a shared primitive or a legitimate variant, not a one-off selector chain.
9. Source-owned styles may temporarily follow `legacy-public.css` only through the documented `site-entry.jsx` migration boundary and must remain within validator guardrails.
10. Do not edit generated legacy compatibility CSS as the source of truth. Historical migration work belongs in `legacy-public-source.css` and the shared selector-retirement registry.
11. Keep the default reading surface scannable. Detailed authored material should use progressive disclosure rather than making every page state equally dense.
12. Prefer CSS composition for visual sequence. Runtime DOM manipulation should be reserved for behaviour or content derivation that CSS cannot express.

## Migration status and priority

Completed:

1. canonical tokens and shared foundations established;
2. duplicated base declarations removed from `src/styles.css`;
3. Resources & Investment moved into its canonical component stylesheet, with the former spacing bridge deleted;
4. project overview presentation moved out of `public/project-detail-refresh.css` and into source-owned feature styling;
5. the late public project refresh file deleted;
6. project overview and deliverable-board selector families removed from the runtime legacy bundle before build;
7. project overview `!important` debt reduced to zero;
8. deliverable page foundation, hero and summary grammar moved into `src/styles/deliverable-detail.css` and onto shared design-system tokens;
9. deliverable hero and generic detail-summary selectors retired from the runtime legacy bundle;
10. shared editorial-card, strategic-statement, navigational-card, sequence-card and disclosure recipes established;
11. case for change, benefits/evidence, delivery sequence and detailed-plan disclosures moved away from historical styling and onto the shared grammar;
12. navigation, page actions and planning-stage context moved into shared global chrome;
13. governance, consultation history and RAID moved into owned planning-detail styling;
14. deliverable composition now follows a documented progressive reading sequence, with dense proposition and step detail disclosed on demand;
15. project detail now uses the same hero, statement, navigation-card and rule-led section grammar while retaining a project-specific information hierarchy;
16. Projects and Deliverables indexes now use source-owned portfolio and catalogue grammars;
17. Measures reuses shared filter, metric and catalogue primitives;
18. Timeline presentation is source-owned, its old public shim and legacy selector families are retired, and dependency selection follows the shared interaction grammar;
19. Theory of Change presentation is source-owned and visually approved, the late root stylesheet has been deleted, its causal chain consumes the shared sequence-card primitive, and its disclosures follow the established interaction grammar;
20. `src/styles/post-legacy-cleanup.css` has been deleted and its remaining cross-site contracts moved into their source owner;
21. the Resource & Investment compatibility shim has been deleted and obsolete resource widget selectors are retired before the legacy bundle enters the runtime cascade;
22. `index.html` no longer late-loads any CSS;
23. legacy selector retirement is defined once in `scripts/style-retirement-config.mjs` and shared by generation and validation;
24. the approved landing presentation is source-owned in `src/styles/landing-overview.css`, with its historical selector families retired from the runtime compatibility bundle and no `!important` debt;
25. the split KING'S EDGE / MOBILISATION PLAN header identity is source-owned in `src/styles/global-chrome.css`, with the historical `.brand` family retired from runtime compatibility CSS;
26. the Projects index is fully source-owned in `src/styles/portfolio-overview.css`; residual project-board/card selectors and their generic `.owner`/`.lead` `!important` rules have been removed from `src/styles.css` and guarded against reintroduction;
27. Deliverables and Measures catalogue navigation is fully source-owned in `src/styles/index-navigation.css`; residual `.toolbar`, `.index-list`, `.index-row` and `.index-meta` rules have been removed from `src/styles.css` and guarded against reintroduction;
28. obsolete `.depends` screen styling has been removed from `src/styles.css`, leaving no screen-level `!important`; validation preserves that rule while allowing only the isolated A3 print visibility exception.

Next:

1. progressively shrink `legacy-public-source.css` as each retired feature family becomes safe to delete permanently;
2. move temporary selector aliases onto explicit `.ds-*` classes as the React markup is decomposed;
3. move landing public-facing copy into explicit authored markup when the `Landing` component is decomposed;
4. continue decomposing residual generic presentation in `src/styles.css` into its canonical owners;
5. delete the generated legacy compatibility system once no live feature depends on it.

The aim is progressive retirement of legacy CSS rather than a risky whole-site rewrite.
