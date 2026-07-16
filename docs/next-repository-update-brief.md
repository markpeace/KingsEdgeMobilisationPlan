# Next implementation brief

Background planning document. Do not render this file in the app.

## Current position

The source-of-truth cleanup has been completed.

`src/data/kings-edge-plan.json` now carries the canonical project order and IDs directly:

1. `2.1` Curriculum Embedded Graduate Advantage
2. `2.2` A Co-Curricular Scaffold for Purpose
3. `2.3` An Extra-Curricular Invitation to Participate
4. `2.4` Articulating and Evidencing The King's Graduate Premium

`src/plan-utils.js` no longer performs hidden project display-ID, display-title or display-order remapping. The app should render the JSON source of truth.

`planningStatus` is the only canonical planning-stage workflow.

Allowed values:

- `pre-draft`
- `proposition-draft` (Proposition draft)
- `draft` (Delivery draft)
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Deliverables default to `pre-draft` unless explicitly moved to a later `planningStatus`.

Do not use these as planning-stage workflows:

- `tags`
- `planningMaturity`
- `visibility`
- `src/data/status.json`

## Summary convention

Use `summary` for the short card-facing essence.

Use `detailSummary` for the fuller explanation shown on project and deliverable detail pages.

The first sentence should capture the proposition clearly, but the detail page can carry a richer description underneath it. Do not force all descriptive content into `summary`.

## Next task

The next task is project manager mode content work, not source migration and not developer-mode UI work.

Use JSON as the primary editing surface, especially `src/data/kings-edge-plan.json`.

## Recommended working rhythm

### First pass: project naming and description

Work through the four projects in order and sharpen:

- project title;
- card-facing `summary`;
- fuller `detailSummary`, where useful;
- institutional transformation claim;
- whether the four deliverables underneath still feel like the right grouping.

The project titles need to name a mobilisable programme of work, not only describe a strategic domain.

### Second pass: deliverables from pre-draft to Proposition draft

For each deliverable, test:

- is the title doing the right work?
- does the `summary` capture the essence clearly?
- is a fuller `detailSummary` needed?
- is the problem sharp enough?
- is the intended change genuinely transformational?
- are the intended benefits distinct from possible outputs?
- is the proposition coherent enough to test with others?
- what would need to be true for this to become Proposition draft?

A deliverable moves from `pre-draft` to Proposition draft once these have been scrutinised:

- case for change;
- benefits;
- summary and fuller proposition.

### Third pass: Proposition draft to Delivery draft

Mock out and scrutinise:

- ownership;
- outputs;
- measures;
- delivery steps;
- dependencies;
- step-level resources;
- investment ask, if any;
- risks, issues, assumptions and decisions.

## Source-of-truth guardrails

Do not add hidden remapping back into `src/plan-utils.js`.

Do not use `src/data/schema-example-content.json` as a hidden overlay. It has been retired.

Do not use `src/data/status.json` as the planning-stage workflow.

Do not introduce another tagging workflow.

If a project title, order, ID or grouping is wrong, fix the JSON source of truth.

## Risks to manage

### Risk: project titles do two jobs badly

Mitigation: distinguish strategic domain, mobilisable programme of work and public-facing title. Choose titles that can hold the work and make sense to senior leaders.

### Risk: summaries become too heavy

Mitigation: keep `summary` concise for cards and use `detailSummary` for detail-page context.

### Risk: deliverables move to Delivery draft too early

Mitigation: use Proposition draft for coherent thinking that is ready to test, and reserve Delivery draft for a mocked-out delivery model.

### Risk: benefits become disguised outputs

Mitigation: write benefits as realised value through use. Keep outputs as tangible products.

### Risk: measures become activity counts

Mitigation: write measures as evidence questions or indicators that show whether benefits are happening.

### Risk: resource asks are blurred

Mitigation: separate existing capacity, new investment and enabling conditions.

## Next practical move

Start project manager mode with Project `2.1`, then move through `2.2`, `2.3` and `2.4`.

For each project, produce a proposed refined title, summary, detail summary and transformation claim before editing JSON.
