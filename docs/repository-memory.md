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

Deliverables default to `proposition-development` unless explicitly moved to a later `planningStatus`. `2.1.3`, `2.2.1` and `2.4.3` are at **Resource planning** following the 1 September 2026 delivery-lead sense-check and subsequent resource-planning passes. Their delivery routes and indicative mobilisation envelopes are authored, but no Board or resource approval is implied. `2.1.1` is conservatively at Plan validation.

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

**Settled 7 September 2026:** the source-plan baseline is now the recommended **Core** case. Package 4 is **£53k in 2026/27, £119.5k in 2027/28 and £79.5k in 2028/29: £252k across mobilisation**.

Year 1 remains unchanged. Direct investment is £42.5k: £22.5k protected practitioner discovery/backfill for purpose; one £7.5k paid student discovery/co-design envelope held once for the connected package; £7.5k bounded student technical prototyping for the skills proof of concept; and £5k trusted-record discovery/prototype testing. The package also carries £10.5k of apportioned shared funded capacity in Year 1: £5.25k Deputy Director and £5.25k Project Officer.

Year 2 now holds **£100k** of direct trailblazer capability: £30k purpose, £40k skills and £30k trusted record, plus £19.5k apportioned shared capacity. Year 3 holds **£60k** of conditional institutionalisation: £15k purpose, £25k skills and £20k trusted record, plus £19.5k apportioned shared capacity.

The Core case intentionally uses a deliberately bounded trailblazer portfolio and expects mainstream curriculum, Registry, student-facing services and Digital Hub routes to carry more of eventual institutionalisation. A materially larger cohort or rollout belongs in an explicit Enhanced option.

There is no current Package 4 allocation from the shared analytics or programme/project-management resources. The only presently identifiable recurrent BAU liability is approximately **£9k p.a.**, the package’s 0.10 share of the permanent Deputy Director post. Enduring practitioner, curriculum/skills governance and Registry/recognition operating requirements remain TBC until mobilisation evidence shows what needs to persist.

### King’s Edge Core investment rebaseline

**Settled 7 September 2026:** the actual King’s Edge plan has been rebased to the recommended **Core** investment case. Economy and Enhanced are option overlays for portfolio decision-making; they are not alternative source-plan baselines.

The Core rebaseline protects Year 1 discovery, evidence, live testing and the first Beyond-Course opportunity portfolio. It reduces large later-year commitments that should only be released when evidence exists.

The current King’s Edge Core profile is:

- **2026/27: £560.2k**
- **2027/28: £1.2675m**
- **2028/29: £1.3625m**
- **Three-year mobilisation: £3.1902m**

This is **£738k below** the previous £3.9282m source-plan baseline.

The four Core package profiles are:

- **Student Purpose, Skills and Educational Recognition:** £53k / £119.5k / £79.5k = **£252k**.
- **Experiential Learning in the Curriculum:** £58.8k / £131.1k / £151.1k = **£341k**.
- **Beyond-Course Opportunity and Participation:** £278.5k / £751.95k / £801.95k = **£1.8324m**.
- **Graduate Futures Intelligence and Value:** £169.9k / £264.95k / £329.95k = **£764.8k**.

The main rebaseline decisions are:

- partnership infrastructure: **£400k p.a. Core assumption** in Years 2 and 3, replacing the previous £600k holding assumption;
- curriculum experiential implementation: **£40k Year 2 / £60k Year 3**, with separate £10k annual co-design/evaluation retained;
- Purpose / Skills / Recognition direct scale envelopes: **£100k Year 2 / £60k Year 3**;
- Student Life activation: **£30k Year 2 / £30k Year 3**;
- Graduate Futures activation/reputation delivery: **0.5 FTE Year 1 and 0.75 FTE Years 2 and 3**, with activation/research envelopes of **£25k / £35k / £50k**;
- Beyond-Course opportunity commissioning remains deliberately protected at **£150k / £200k / £250k**;
- the Strategic Partnerships, Profile & External Engagement Fund remains **£25k / £35k / £45k**, with **£45k p.a. BAU**;
- any new **Student Opportunities Fund award pot is outside the King’s Edge ask**. Design and consolidation work remains in `2.2.2`, but awards require a separate institutional, consolidated-fund, philanthropic or other funding route.

The current identifiable King’s Edge Core recurrent exposure is approximately **£834.5k p.a. plus TBC**. It includes a £400k partnership-infrastructure Core assumption, £175k enduring opportunity commissioning, the relevant Deputy Director shares and the current Graduate Futures planning proxy. It is not an approved recurrent budget.

### King’s Edge and Digital investment boundary

The decision-support view is held in `docs/portfolio-investment-packages.md`.

**Settled:** the Digital Student Experience Hub is a separate institutional investment and must not be rolled into the headline King’s Edge funding ask. King’s Edge is the first substantive native product domain and a critical proving use case for the Hub, but the Hub has broader institutional scope and value.

The current **Digital Student Experience Hub high-water profile** is:

- **2026/27: £593.360k**
- **2027/28: £876.296k**
- **2028/29: £926.296k**
- **Three-year itemised high water: £2.395952m**

The Hub retains a **£3m working three-year strategic envelope**, leaving **£604.048k headroom** at the current high-water itemisation. This is a ceiling and planning guardrail, not a spending target.

For dependency and whole-system planning only, King’s Edge Core plus the current Digital Hub high-water case is **£1.15356m / £2.143796m / £2.288796m = £5.586152m across three years**. Do **not** describe this combined figure as the King’s Edge ask.

The current recurrent exposure views are approximately **£834.5k p.a. plus TBC for King’s Edge Core** and **c.£893.296k p.a. plus TBC knowledge/content operating cost for the Digital Hub**. The Digital figure is a high-water risk ceiling rather than a settled BAU budget.

The Digital Hub’s current evidence-backed reductions and qualifications include a 50/50 Student/Staff Hub Product Manager allocation, 0.75 FTE average Solution Architecture in Year 1, and explicit treatment of the former Dynamics Developer line as a D365 / Power Platform contingency. Digital remains under active validation and was deliberately not changed by the King’s Edge Core rebaseline.

### Graduate Futures and external engagement

The Graduate Futures package uses a Year 1 programme/project-management share of **0.20 FTE / £13.2k** and now has a Core profile of **£169.9k / £264.95k / £329.95k = £764.8k across mobilisation**.

`2.4.4 Graduate Premium Engagement, Reputation and Survey Performance` remains the accounting home for the **Strategic Partnerships, Profile & External Engagement Fund**: **£25k in 2026/27, £35k in 2027/28 and £45k in 2028/29**, with a **£45k p.a. recurrent BAU planning liability from 2029/30**. Budget control sits with King’s Edge programme leadership and the fund may be deployed across the King’s Edge portfolio where activity advances strategic partnership development, external profile, purposeful UK/international mobility, partner hosting or reciprocal visits, networks, convening or related external engagement. It must not be double counted elsewhere.

### Deferred 2.3.3 and shared-resource reconciliation

Deliverable **2.3.3 is deferred**. Its former 0.10 FTE Deputy Director allocation and 0.05 / 0.10 / 0.10 FTE Project Officer allocations have been redeployed to **2.3.4** so funded shared capacity is not parked against inactive work.

The Core rebaseline does not alter the coherent shared-resource envelopes or their allocation. The Year 1 shared-resource registry remains **£181.5k**, attributed exactly once across active King’s Edge packages.

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

- **Core is now the source-plan costing baseline.** Economy and Enhanced should be expressed as explicit option overlays rather than silently changing the plan when they are presented.
- Package 4 remains at `resource-planning` pending scrutiny and plan validation. Its later-year cash envelopes remain conditional on evidence.
- The £400k partnership-infrastructure figure is a Core planning assumption to test in Year 1, not a settled workforce model or BAU commitment.
- The Student Opportunities Fund award pot is outside the King’s Edge ask.
- Digital Student Experience Hub remains a separate investment and is under active Digital and IT validation.
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
