# Repository memory and decision log

Background repository memory only. Do not render this document in the app. Do not treat it as programme content. This file exists to help future conversations understand durable decisions already made about the repository, the schema and the working process.

## How to use this file

Read this after `docs/hydration-guide.md`, `docs/working-modes.md`, `docs/deliverable-schema.md` and `docs/schema-source-of-truth-audit.md` when starting a new chat.

Use it to understand the durable decisions. Decisions marked provisional can be revisited if the plan or app needs change.

## Decision status labels

- Settled: proceed on this basis unless the user explicitly reopens it.
- Provisional: use for now, but revisit when the prototype matures.
- Open: known issue or future decision.

## Current state

The source-of-truth migration has been applied.

`src/data/kings-edge-plan.json` now carries the canonical project order and IDs directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

`src/plan-utils.js` should not contain hidden project renumbering, title substitution or display-order remapping. It should only do legitimate utility work: schema normalisation, timeline period mapping, lookup construction and dependency indexing.

`src/data/schema-example-content.json` is retired as an overlay. It should not silently add richer content or override deliverables.

`src/data/step-dependencies.json` is currently empty. Step dependencies should normally live in the source plan data unless there is a clear reason for an explicit override.

`src/data/status.json` has no item-specific entries. Planning stage is tracked through `planningStatus` in the core plan data, not through status metadata.

## Settled decisions

### Working modes

The repository supports two working modes.

Project manager mode is JSON-first. It changes the plan content, structure or schema. It should mainly work in `src/data/*` and use `src/plan-utils.js` only to understand normalisation.

Developer mode is rendering-first. It changes React, CSS, HTML and app behaviour. It should not change plan content unless explicitly asked.

### JSON is the source of truth

Plan content should live in JSON, not be hard-coded into React or CSS.

The frontend should render the source data. It should not add display workarounds to hide source-data problems.

### Deliverables are the main planning object

Projects give the strategic map. Deliverables are the main unit of planning scrutiny. Steps provide sequencing.

Each deliverable should be able to answer why it exists, what value it creates, what outputs it produces, how it is evidenced, who owns it, what it needs and what would count as done.

### Benefits, outputs and measures are distinct

Outputs are tangible things produced.

Benefits are value realised through use.

Measures are evidence questions or indicators that show whether the benefit is happening.

Do not collapse these into a generic “outputs and KPIs” field.

### Measures are broader than KPIs

Use “measures” rather than “KPIs” as the main concept. Measures may be quantitative, qualitative, adoption-based, assurance-based or readiness-based.

### Definition of done sits at deliverable level

A deliverable is not done just because an output exists. Definition of done should cover acceptance, ownership, measures, adoption route, dependencies and handover where relevant.

### Canonical planning-stage workflow

The only canonical planning-stage workflow is `planningStatus`.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

All current deliverables are `pre-draft` unless explicitly moved to a later `planningStatus`.

Do not use `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` as the planning-stage workflow.

### Planning status is different from planning maturity

`planningStatus` is the staff-facing settledness of the plan.

`planningMaturity` is optional internal nuance about the kind of planning work underway.

If a future agent is unsure which field matters, use `planningStatus`.

### Generic tags are thematic only

The `tags` field is optional thematic metadata. It is not a status field and should not be used for pre-draft, draft, decision-ready, or delivery stages.

If tags create confusion during hydration, ignore them or remove them from display. Do not create a second tagging workflow.

### `src/data/status.json` is not the planning workflow

`src/data/status.json` is hidden delivery-control metadata. It is not the planning-stage source of truth.

Status pills are visually hidden. Do not reintroduce them unless explicitly asked.

### Reveal detailed plan is progressive disclosure, not security

The “Reveal detailed plan” pattern is for context and progressive disclosure. It is not a security control.

Restricted material should not be shipped in broad client-side JSON unless real access control or separate builds exist.

### Resourcing must distinguish existing capacity, new investment and enabling conditions

Resource modelling should separate:

- existing capacity to align;
- new cash investment;
- enabling conditions.

This distinction matters for strategic investment fund asks.

### Measures and Timeline views must respect planning status

Measures and Timeline should not present pre-draft assumptions as approved KPIs or firm delivery commitments.

Pre-draft measures should be hidden by default or clearly labelled as emerging. Pre-draft timeline items should be visually indicative.

### Visibility classification is handling guidance, not access control

`visibility` may use `staff-visible`, `internal-planning` and `restricted`, but these are handling labels, not security.

## Current working assumptions

- The next content task is project-by-project naming and description scrutiny.
- After project naming, the next major task is deliverable-by-deliverable scrutiny to move items from `pre-draft` to `draft`.
- The plan should remain senior-leadership ready: clear, concise, defensible and not over-bureaucratic.
- Benefits should be written as realised value, not disguised outputs.
- Measures should test whether benefits are happening, not merely count activity.
- Uncertainty should be visible through planning status, maturity, assumptions, decisions and TBC fields.
- Resource asks should distinguish existing capacity, new investment and enabling conditions.
- Future PM input may later formalise RACI, controls, budgets and benefits realisation.

## Recommended project manager rhythm

First pass: project naming and description.

For each of the four projects, sharpen:

- project title;
- one-line summary;
- institutional transformation claim;
- whether the four deliverables underneath still feel like the right grouping.

Second pass: deliverables from pre-draft to draft.

For each deliverable, test:

- whether the title is doing the right work;
- whether the problem is sharp enough;
- whether the intended change is genuinely transformational;
- whether benefits, outputs and measures are distinct;
- whether dependencies and ownership are plausible;
- what needs to be true for the deliverable to become `draft`.

## Known cautions for future agents

- Do not confuse documentation in `docs/` with programme content.
- Do not render this file in the app.
- Do not hard-code plan text into React or CSS.
- Do not edit JSON in developer mode unless explicitly asked.
- Do not edit React or CSS in project manager mode unless explicitly asked.
- Do not rename IDs without checking routing, dependencies, step references, feeds and related deliverables.
- Do not assume every TBC is a weakness. Some TBCs are honest planning maturity markers.
- Do not treat reveal controls, filters or CSS as security.
- Do not put genuinely restricted content into broad client-side JSON.
- Do not present pre-draft measures as approved KPIs.
- Do not present pre-draft timeline items as firm delivery commitments.
- Do not add another tagging workflow.
- Do not add display-remapping workarounds for project order or numbering.
