# Next implementation brief

Background planning document. Do not render this file in the app.

## Current position

The source-of-truth cleanup has been completed.

`src/data/kings-edge-plan.json` now carries the canonical project order and IDs directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

`src/plan-utils.js` no longer performs hidden project display-ID, display-title or display-order remapping. The app should render the JSON source of truth.

`planningStatus` is the only canonical planning-stage workflow.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

All current deliverables are `pre-draft` unless explicitly moved to a later `planningStatus`.

Do not use these as planning-stage workflows:

- `tags`
- `planningMaturity`
- `visibility`
- `src/data/status.json`

## Next task

The next task is project manager mode content work, not source migration and not developer-mode UI work.

Use JSON as the primary editing surface, especially `src/data/kings-edge-plan.json`.

## Recommended working rhythm

### First pass: project naming and description

Work through the four projects in order and sharpen:

- project title;
- one-line summary;
- institutional transformation claim;
- whether the four deliverables underneath still feel like the right grouping.

The project titles need to name a mobilisable programme of work, not only describe a strategic domain.

### Second pass: deliverables from pre-draft to draft

For each deliverable, test:

- is the title doing the right work?
- is the problem sharp enough?
- is the intended change genuinely transformational?
- are benefits, outputs and measures distinct?
- are dependencies and ownership plausible?
- what would need to be true for this to become `draft`?

A deliverable only moves from `pre-draft` to `draft` once these have been scrutinised:

- case for change;
- ownership;
- benefits;
- outputs;
- measures;
- definition of done;
- delivery steps;
- dependencies;
- resources;
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

### Risk: deliverables move to draft too early

Mitigation: keep everything `pre-draft` until the deliverable has been scrutinised against the schema.

### Risk: benefits become disguised outputs

Mitigation: write benefits as realised value through use. Keep outputs as tangible products.

### Risk: measures become activity counts

Mitigation: write measures as evidence questions or indicators that show whether benefits are happening.

### Risk: resource asks are blurred

Mitigation: separate existing capacity, new investment and enabling conditions.

## Next practical move

Start project manager mode with Project `2.1`, then move through `2.2`, `2.3` and `2.4`.

For each project, produce a proposed refined title, summary and transformation claim before editing JSON.
