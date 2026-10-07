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

### Future Jobs Roadmap external validation and boundaries

**Settled 14 September 2026:** Universities UK’s Future Jobs Roadmap, published on **10 September 2026**, should be treated as **subsequent external validation of the King’s Edge direction**, not as the origin of the programme or a reason to retrospectively rewrite the approved 5 August 2026 Theory of Change.

The strongest substantive alignment is in meaningful work-based and experiential learning at scale; clearer articulation of graduate capability and the emerging national skills language; stronger employer connection and easier partner engagement; and evidence and recognition that help students understand and carry what they have developed.

The roadmap’s work-based-learning milestones, **50% undergraduate access by 2030 and universal access by 2035**, are an external benchmark for `2.1.2`, not a ready-made King’s definition or an automatic King’s commitment. `2.1.2` must define which forms of curriculum, near-curriculum and co-curricular experiential learning are sufficiently meaningful to qualify. `2.1.4` should then establish a defensible estimate of student access to qualifying provision, while `2.2.4` must continue to report total opportunity reach separately from the subset that qualifies towards the experiential-learning entitlement.

For skills, `2.1.3` should continue to treat the **UK Standard Skills Classification as the leading candidate, not a settled institutional choice**. The national Future Jobs and UKSSC context makes the experiment more strategically important, but the decision remains adopt / adapt / reconsider on the basis of technical, disciplinary, student and external-user evidence.

The UUK AI commitments sit principally **outside the current King’s Edge boundary**. Discipline-contextualised AI capability should be carried through the wider Education Delivery Framework, with Curriculum Framework and Review as the principal curriculum route and Education Cultures able to support educator practice and experimentation.

The current King’s Edge plan does **not** contain developed responses to lifetime careers support or regional SME graduate schemes. These remain genuine wider institutional questions and should not be retrofitted into existing deliverables merely to create apparent roadmap coverage.

Avoid creating a generic UUK-alignment layer across the repository. Reference Future Jobs only where it provides material external validation, a meaningful benchmark, a design requirement or a relevant evidence source.

### King’s Edge Core investment rebaseline

**Superseded September baseline:** the 7 September 2026 Core case was £560.2k / £1.2675m / £1.3625m = £3.1902m, with £400k p.a. of generic partnership infrastructure in 2027/28 and 2028/29. That remains useful history but is no longer the current financial baseline.

### October 2026 investment-window and cash-profile baseline

**Settled 7 October 2026:** the King’s Edge mobilisation investment case has a hard three-year window of **2026/27 to 2028/29**. All mobilisation investment must fit inside that window. Activity from July 2029 onward may remain in the plan only when it is explicitly BAU/recurrent exposure, benefits realisation, ongoing evaluation/service improvement, or a separate institutional investment.

For `2.2.2 Future-Proofed Employability & Experiential Infrastructure`, the full operating model must be live by June 2029. The agreed workforce phasing is:

- September 2027: UK Experiential Partnerships & Opportunity Development team, international G6, Global Mobility G6 + G5, and £50k international non-pay envelope;
- September 2028: East Asia G5 plus Graduate Transitions G7 + G6;
- January 2029: final two international G5 posts covering South/South East Asia and Europe/North America.

The investment arithmetic now uses **in-year planning budgets**, not annualised run-rates. September starts are modelled at ten months in the first academic year, January 2029 starts at six months, and the international non-pay envelope is budgeted in full in each active year. On this basis `2.2.2` is:

- **2026/27: £0 new direct investment**
- **2027/28: £367,569**
- **2028/29: £632,071**
- **three-year direct profile: £999,640**
- **fully mobilised annualised exit run-rate by June 2029: £714,058**

The £714,058 figure is not a fourth-year budget and must not be inserted into 2029/30 mobilisation arithmetic.

The current five-area Core in-year budget is therefore:

- **2026/27: £560.2k**
- **2027/28: £1.235069m**
- **2028/29: £1.594571m**
- **three-year Core: £3.389840m**

Current option totals are:

- **Economy:** £460.2k / £1.123569m / £1.458071m = **£3.041840m**
- **Core:** £560.2k / £1.235069m / £1.594571m = **£3.389840m**
- **Enhanced:** £610.2k / £1.531569m / £2.061071m = **£4.202840m**

The current five-area display is interim. The next investment-case narrative rewrite should test **King’s Architecture for Employability** as an expanded first investment area combining the developmental/philosophical architecture with the `2.2.2` staffing and partnership infrastructure. This is an investment-grouping change only; do not alter the 4 x 4 delivery-plan IDs to make the investment story fit.

`2.2.4 Flexible Adjunct Experiential & Thematic Opportunities` now has explicit Core mobilisation budgets of **£150k / £200k / £250k = £600k** across the three investment years. Its **£175k p.a. requirement from July 2029 is BAU**, not a ghost fourth mobilisation year.

`2.3.1` must complete its mobilisation-to-BAU stewardship transition by June 2029. Its **£15k p.a. analytical requirement from July 2029** remains a separate BAU planning liability.

Current grade-based `2.2.2` costs are treated as fully loaded including employer NI and pension/superannuation, subject to Finance/HR validation. Do not add an arbitrary additional on-cost percentage on top without confirming that the planning figures are salary-only.

### King’s Edge and Digital investment boundary

**Settled:** the Digital Student Experience Hub is a separate institutional investment and must not be rolled into the headline King’s Edge funding ask. King’s Edge is the first substantive native product domain and a critical proving use case for the Hub, but the Hub has broader institutional scope and value.

The current **Digital Student Experience Hub high-water profile** is:

- **2026/27: £593.360k**
- **2027/28: £876.296k**
- **2028/29: £926.296k**
- **Three-year itemised high water: £2.395952m**

The Hub retains a **£3m working three-year strategic envelope**, leaving **£604.048k headroom** at the current high-water itemisation. This is a ceiling and planning guardrail, not a spending target.

For dependency and whole-system planning only, King’s Edge Core plus the current Digital Hub high-water case is now **£1.153560m / £2.111365m / £2.520867m = £5.785792m across three years**. Do **not** describe this combined figure as the King’s Edge ask.

The Digital Hub’s recurrent exposure and detailed workforce/service assumptions remain governed by its own source data and investment boundary.
