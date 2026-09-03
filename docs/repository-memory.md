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

1. `2.1` Curriculum Embedded Graduate Advantage
2. `2.2` A Co-Curricular Scaffold for Purpose
3. `2.3` An Extra-Curricular Invitation to Participate
4. `2.4` Defining, Evidencing and Activating the King’s Graduate Premium

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

### Summary and detail summary have different jobs

Use `summary` for the short card-facing essence. It should usually be one clear sentence.

Use `detailSummary` for fuller explanation on project and deliverable detail pages. Do not force all descriptive content into `summary`.

Cards and index rows should use `summary`. Detail pages should render `summary` first, then `detailSummary` underneath where it exists and is distinct.

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

- `proposition-development`
- `proposition-review`
- `delivery-design`
- `resource-planning`
- `plan-validation`
- `portfolio-board-approval`
- `resource-confirmation`
- `approved-to-mobilise`

Deliverables default to `proposition-development` unless explicitly moved to a later `planningStatus`. `2.1.3`, `2.2.1` and `2.4.3` are now at **Resource planning** following the 1 September 2026 delivery-lead sense-check and the 3 September 2026 package resource-planning pass. Their delivery routes and indicative mobilisation envelopes are authored, but no Board or resource approval is implied. `2.1.1` is conservatively at Plan validation.

The canonical work, gate and UX behaviour for each stage are documented in `docs/deliverable-gates.md` and centralised in `src/planning-status.js`.

Do not use `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` as the planning-stage workflow.

### Package 4 mobilisation pattern

`2.2.1`, `2.1.3` and `2.4.3` form the working portfolio package **Student Purpose, Skills and Educational Recognition**.

Their settled mobilisation pattern is:

1. **Discover** before fixing the institutional solution.
2. **Trailblaze and build capability** with a small number of willing partners prepared to go sufficiently deep to test the proposition properly.
3. **Test portability** so that success dependent on unusual local enthusiasm is not mistaken for a scalable institutional model.
4. **Institutionalise what works** through mainstream curriculum, policy, operating and Digital Student Experience Hub routes.

This is intentionally deeper than a lightweight pilot. Year 1 is principally discovery, Year 2 is deep trailblazer use and capability building, and Year 3 institutionalises only the elements that have demonstrated value and portability.

For `2.2.1`, **A Conversation about Purpose with Every Student** remains the proposition. King’s Canvas is its living student-facing expression, not the proposition itself. Human developmental practice should be discovered and tested before technology is allowed to define the model.

For `2.1.3`, the UK Standard Skills Classification is the leading candidate for a shared skills architecture, not a settled institutional choice. Year 1 explicitly tests taxonomy fitness, technical mediation and usable curriculum evidence and may result in adoption, adaptation or reconsideration.

For `2.4.3`, the enduring container is deliberately open. Discovery should resolve the trust and authority model before King’s decides whether the final experience is an enhanced transcript, broader portfolio containing the transcript, HEAR successor or hybrid. Student claim, student evidence, institutional recognition and King’s certification must remain visibly distinct.

Substantive enduring digital implementation for all three should be carried through the Digital Student Experience Hub rather than rebilled as separate King’s Edge platform development.

### Package 4 resource-planning basis

The current Package 4 business-case planning shape is **£53k in 2026/27, £169.5k in 2027/28 and £119.5k in 2028/29: £342k across mobilisation**.

Year 1 direct investment is £42.5k: £22.5k protected practitioner discovery/backfill for purpose; one £7.5k paid student discovery/co-design envelope held once for the connected package; £7.5k bounded student technical prototyping for the skills proof of concept; and £5k trusted-record discovery/prototype testing. The package also carries £10.5k of apportioned shared funded capacity in Year 1: £5.25k Deputy Director and £5.25k Project Officer.

Year 2 holds £150k of direct trailblazer capability envelopes: £45k purpose, £60k skills and £45k trusted record, plus £19.5k apportioned shared capacity. Year 3 holds £100k of conditional institutionalisation envelopes: £25k purpose, £40k skills and £35k trusted record, plus £19.5k apportioned shared capacity.

The later-year direct figures are planning envelopes rather than automatic spending targets. Year 2 should be recalibrated after discovery and trailblazer selection. Year 3 should be released only against elements that survive portability testing.

There is no current Package 4 allocation from the shared analytics or programme/project-management resources. The only presently identifiable recurrent BAU liability is approximately **£9k p.a.**, the package’s 0.10 share of the permanent Deputy Director post. Enduring practitioner, curriculum/skills governance and Registry/recognition operating requirements remain TBC until mobilisation evidence shows what needs to persist.

### Five-package portfolio investment reconciliation

The completed five-package decision-support view is held in `docs/portfolio-investment-packages.md`.

As of 3 September 2026, the reconciled **itemised** mobilisation profile is **£893.2k in 2026/27, £1.998m in 2027/28 and £2.148m in 2028/29: £5.0392m across the three-year mobilisation**.

The Digital Student Experience Hub separately carries a **£3m working three-year strategic envelope** in the 4.1.2 decision log, of which £1.216m is currently itemised. If that full Digital envelope were eventually required, the equivalent five-package working envelope would be approximately **£6.8232m**, before still-unquantified items such as a Student Opportunities Fund award pot. Do not treat the £3m envelope as an itemised or approved commitment.

The current **gross identifiable BAU exposure is approximately £1.425m p.a. plus TBC**. Of this, £600k p.a. is explicitly a holding assumption for the future partnership-infrastructure model and must be tested during Year 1. Excluding that holding assumption, approximately £825k p.a. is currently identifiable, while several other recurrent requirements remain open.

The Graduate Futures package has been reconciled to the current shared PM registry: its Year 1 programme/project-management share is **0.20 FTE / £13.2k**, giving **£144.9k Year 1 and approximately £732.8k across mobilisation**, rather than the earlier £148.2k / c.£736k view.

Deliverable **2.3.3 is deferred**. Its former 0.10 FTE Deputy Director allocation and 0.05 / 0.10 / 0.10 FTE Project Officer allocations have been redeployed to **2.3.4** so funded shared capacity is not parked against inactive work. This produces a reconciled Beyond-Course package profile of **£278.5k / £971.95k / £1.03195m = £2.2824m**, with current identifiable BAU of approximately **£847k p.a. plus TBC**. The reallocation does not increase the coherent shared-resource envelopes.

### Planning status is different from planning maturity

`planningStatus` is the staff-facing settledness of the plan.

`planningMaturity` is optional internal nuance about the kind of planning work underway.

If a future agent is unsure which field matters, use `planningStatus`.

### Generic tags are thematic only

The `tags` field is optional thematic metadata. It is not a status field and should not be used for any proposition, planning, approval or delivery stage.

If tags create confusion during hydration, ignore them or remove them from display. Do not create a second tagging workflow.

### `src/data/status.json` is not the planning workflow

`src/data/status.json` is hidden delivery-control metadata. It is not the planning-stage source of truth.

Operational status is authored against steps only after the parent deliverable is approved to mobilise. Do not display a competing operational status on deliverable cards.

### Decisions and consultation log

Each deliverable carries a simple `decisionLog` array containing material consultations and decisions, or an empty array until there is something to record. Entries use `date`, `type`, `forum` and `outcome`, with optional `seenBy` and `notes`. The log does not automatically drive `planningStatus` and does not replace decisions attached to the step they gate.

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

Measures and Timeline should not present pre-approval assumptions as approved KPIs or firm delivery commitments.

Measures and timeline sequencing appear from Delivery design. Timeline steps remain visually indicative and do not show operational status until Approved to mobilise.

### Visibility classification is handling guidance, not access control

`visibility` may use `staff-visible`, `internal-planning` and `restricted`, but these are handling labels, not security.

## Current working assumptions

- Package 4 has completed a first resource-planning pass and remains at `resource-planning` pending scrutiny and plan validation. Its cash envelopes are explicitly planning assumptions, especially in Years 2 and 3.
- Deliverable development follows the stages in `docs/deliverable-gates.md`, keeping delivery design separate from resource planning and both separate from later approval.
- The plan should remain senior-leadership ready: clear, concise, defensible and not over-bureaucratic.
- Benefits should be written as realised value, not disguised outputs.
- Measures should test whether benefits are happening, not merely count activity.
- Uncertainty should be visible through planning status, maturity, assumptions, decisions and TBC fields.
- Resource asks should distinguish existing capacity, new investment and enabling conditions.
- Future PM input may later formalise RACI, controls, budgets and benefits realisation.

## Recommended project manager rhythm

First pass: sharpen propositions and move them through the appropriate development gate.

For each project or package, test:

- project and deliverable titles;
- card-facing `summary`;
- richer `detailSummary`, where useful;
- institutional transformation claim;
- whether the deliverables still form the right grouping;
- whether a common mobilisation pattern adds coherence without flattening meaningful differences.

Second pass: design the unconstrained delivery route before cost constrains it.

For each deliverable, test:

- whether the title is doing the right work;
- whether the summary captures the essence clearly;
- whether a fuller detail summary is needed;
- whether the problem is sharp enough;
- whether the intended change is genuinely transformational;
- whether benefits, outputs and measures are distinct;
- whether dependencies and ownership are plausible;
- whether the sequence includes a credible route from experimentation to institutional adoption;
- what needs to be true to pass its current gate.

Third pass: resource the agreed delivery route and reconcile shared investment at package level without inventing false precision in later years.

Fourth pass: validate the plan as a whole, including benefits, measures, ownership, dependencies, assumptions, resource sufficiency and whether the Year 1 return is genuinely decision-ready.

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
- Do not present pre-approval measures as approved KPIs.
- Do not present pre-approval timeline items as firm delivery commitments or operational progress.
- Do not add another tagging workflow.
- Do not add display-remapping workarounds for project order or numbering.
