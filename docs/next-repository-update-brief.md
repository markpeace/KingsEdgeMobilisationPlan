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

- `proposition-development`
- `proposition-review`
- `delivery-design`
- `resource-planning`
- `plan-validation`
- `portfolio-board-approval`
- `resource-confirmation`
- `approved-to-mobilise`

Deliverables default to `proposition-development` unless explicitly moved to a later `planningStatus`. See `docs/deliverable-gates.md` for the complete process.

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

### Second pass: proposition development and review

For each deliverable, test:

- is the title doing the right work?
- does the `summary` capture the essence clearly?
- is a fuller `detailSummary` needed?
- is the problem sharp enough?
- is the intended change genuinely transformational?
- are the intended benefits distinct from possible outputs?
- is the proposition coherent enough to test with others?
- what would need to be true for this to be ready for an informal proposition sense-check?

A deliverable moves from Proposition development to Proposition review once these have been scrutinised:

- case for change;
- benefits;
- summary and fuller proposition.

The informal review should involve the proposed owner, likely delivery lead and a small reference group of selected senior, key or specialist stakeholders. Record material feedback in `decisionLog`.

### Third pass: delivery design

Design and scrutinise the route without yet constraining it by resource:

- ownership;
- outputs;
- measures;
- delivery steps;
- dependencies;
- risks, issues, assumptions and decisions.

### Fourth pass: resources, validation and approval

Define the resource requirement after the route is coherent. Then validate the complete plan with owners, leads, partners, benefit owners, resource teams and dependency owners. Seek Portfolio Board approval, confirm the resources actually available, and adjust ambition or planning where necessary before marking the deliverable Approved to mobilise.

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

### Risk: deliverables imply approval too early

Mitigation: use the exact gates in `docs/deliverable-gates.md`; record Board and resource decisions separately even when they happen together.

### Risk: benefits become disguised outputs

Mitigation: write benefits as realised value through use. Keep outputs as tangible products.

### Risk: measures become activity counts

Mitigation: write measures as evidence questions or indicators that show whether benefits are happening.

### Risk: resource asks are blurred

Mitigation: separate existing capacity, new investment and enabling conditions.

## Next practical move

Start project manager mode with Project `2.1`, then move through `2.2`, `2.3` and `2.4`.

For each project, produce a proposed refined title, summary, detail summary and transformation claim before editing JSON.
