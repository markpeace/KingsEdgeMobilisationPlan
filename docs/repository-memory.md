# Repository memory and decision log

Background repository memory only. Do not render this document in the app. Do not treat it as programme content. This file exists to help future conversations understand durable decisions already made about the repository, the schema and the working process.

## How to use this file

Read this after `docs/hydration-guide.md`, `docs/working-modes.md`, `docs/deliverable-schema.md` and `docs/schema-source-of-truth-audit.md` when starting a new chat.

Use it to understand durable decisions. Decisions marked provisional can be revisited if the plan or app needs change.

## Decision status labels

- **Settled:** proceed on this basis unless the user explicitly reopens it.
- **Provisional:** use for now, but revisit when the prototype matures.
- **Open:** known issue or future decision.

## Current state

**9 October 2026, parallel plan baseline:** Version 1 remains frozen in `src/data/` and Version 2 begins as an exact independent copy in `src/data/v2/`. The main site's Plan version selector switches the complete content bundle using `?plan=v2`; the default URL is Version 1. The new project and deliverable architecture has not yet been decided. See `docs/plan-versioning.md` and `docs/plan-v1-baseline.json` before restructuring Version 2. Preserve a migration trail for every original item.

The source-of-truth migration has been applied. `src/data/kings-edge-plan.json` carries canonical project order and IDs. Detailed modular deliverables registered through `src/data/deliverables/manifest.json` override inline fallback content. Fully modularised deliverables should normally appear in `kings-edge-plan.json` as an ID reference only, avoiding duplicate detailed representations.

The canonical King’s Edge project architecture remains:

1. `2.1` Curriculum Embedded Graduate Advantage
2. `2.2` A Co-Curricular Scaffold for Purpose
3. `2.3` An Extra-Curricular Invitation to Participate
4. `2.4` Defining, Evidencing and Activating the King’s Graduate Premium

`src/plan-utils.js` should not contain hidden project renumbering, title substitution or display-order remapping. Plan content should live in JSON, not be hard-coded into React or CSS.

## Working mode and planning discipline

Project manager mode is JSON-first. Developer mode is rendering-first. Deliverables are the main planning object; projects provide the strategic map and steps provide sequencing.

Benefits, outputs and measures are distinct. Definition of done sits at deliverable level. Planning stage is tracked through `planningStatus` using the canonical stage values documented in `docs/deliverable-gates.md` and `src/planning-status.js`.

## Package 4 mobilisation pattern

`2.2.1`, `2.1.3` and `2.4.3` form the working package **Student Purpose, Skills and Educational Recognition**. Their settled mobilisation pattern is discover, trailblaze/build capability, test portability, and institutionalise what works. King’s Canvas is the living expression of the Purpose proposition, not the proposition itself. The UK Standard Skills Classification remains the leading candidate rather than a settled institutional choice. The enduring trusted-record container remains open pending evidence.

The settled Core resource profile for this package is **£53k / £119.5k / £79.5k = £252k** across 2026/27 to 2028/29, with only approximately **£9k p.a.** currently identifiable as recurrent BAU and other enduring costs TBC.

## Future Jobs Roadmap

Universities UK’s Future Jobs Roadmap, published 10 September 2026, is subsequent external validation of the King’s Edge direction rather than its origin. Strongest alignment is meaningful work-based and experiential learning, articulation of graduate capability, stronger employer connection, and evidence/recognition. UUK AI commitments sit principally outside King’s Edge, through the wider Education Delivery Framework and Curriculum Framework and Review.

Do not use aggregate King’s Edge participation as a proxy for UUK work-based-learning milestones. Do not retrofit lifetime careers support or regional SME graduate schemes into King’s Edge merely to create apparent roadmap coverage.

## October 2026 employability and experiential infrastructure baseline

**Settled 7 October 2026:** `2.2.2` is **Future-Proofed Employability & Experiential Infrastructure**, led by Andrew Wright with Eleanor Hannan as co-lead. It preserves the common experiential operating model, Student Opportunities Fund design, alumni/philanthropic opportunity growth and shared standards/processes, while adding explicit UK opportunity-development, international employer-engagement, Global Mobility and Graduate Transitions capability.

The canonical **Core** workforce model is:

- International G6 Employer Relations & Insights Manager from October 2026.
- International G5 East Asia Adviser from January 2027.
- Global Mobility G6 Opportunity Development Manager from January 2027.
- Four-post UK Experiential Partnerships & Opportunity Development team from September 2027: 1 x G6 manager, 2 x G5 opportunity-development advisers, 1 x G5 operations/intelligence adviser.
- Global Mobility G5 Opportunity Development Officer from September 2027.
- Graduate Transitions G7 Head + G6 Coach from September 2028.
- International G5 advisers for South/South East Asia and Europe/North America from January 2029.
- International employer-engagement non-pay of £15k in 2026/27 and £50k p.a. thereafter.

The Core `2.2.2` in-year profile is **£112.842k / £438.932k / £640.777k = £1.192551m**, with a **£714.058k annualised exit run-rate by June 2029**. The exit run-rate is not a fourth-year mobilisation budget.

The Global Mobility posts are incremental opportunity-development capacity aligned to the established service and do not duplicate core exchange administration. The Student Opportunities Fund award pot remains outside the King’s Edge ask unless separately funded.

## Investment-window discipline

**Settled 7 October 2026:** the King’s Edge mobilisation investment case has a hard window of **2026/27 to 2028/29**. All mobilisation spend must sit inside that window. Post-June-2029 activity may remain only where it is explicitly BAU/recurrent exposure, benefits realisation, ongoing evaluation/service improvement, or separate institutional investment.

In-year staffing budgets use planning start dates rather than annualised costs: October 2026 is nine months, January starts are six months, and September starts are ten months in their first academic year. Grade-based role costs are treated as fully loaded including employer NI and pension/superannuation, subject to Finance/HR validation.

`2.2.4 Flexible Adjunct Experiential & Thematic Opportunities` has Core commissioning budgets of **£150k / £200k / £250k = £600k** across the three investment years. Its **£175k p.a. from July 2029 is BAU**, not a hidden fourth mobilisation year.

`2.3.1` completes its mobilisation-to-BAU stewardship transition by June 2029. Its **£15k p.a. analytical requirement from July 2029** is a separate BAU liability.

## Four-area investment architecture

**Settled 7 October 2026:** the investment case groups the canonical delivery plan into four decision-support areas without changing the 4 x 4 delivery architecture:

1. **King’s Architecture for Employability**: `2.2.1`, `2.1.3`, `2.4.3`, `2.2.2`.
2. **Experiential Learning in the Curriculum**.
3. **Beyond-Course Opportunity and Participation**.
4. **Graduate Futures Intelligence and Value**.

At King’s, employability is framed as broader than preparation for employment: understanding what matters, developing and applying disciplinary and wider capabilities, building relationships and experience, evidencing learning credibly and making purposeful transitions beyond the degree.

The Core four-area profile is:

- King’s Architecture for Employability: **£1.444551m**.
- Experiential Learning in the Curriculum: **£341k**.
- Beyond-Course Opportunity and Participation: **£1.0324m**.
- Graduate Futures Intelligence and Value: **£764.8k**.
- **Total Core: £3.582751m**, profiled **£673.042k / £1.306432m / £1.603277m**.

## Explicit Economy / Core / Enhanced service models

**Settled as decision-support variants 7 October 2026:** Economy and Enhanced now flex `2.2.2` through coherent workforce/service models rather than applying a percentage haircut or uplift to a protected Core workforce. **Core remains the canonical source-plan baseline.**

### Economy `2.2.2`

Protects the 2026/27 international continuity wave and January 2027 Global Mobility G6, then narrows later capacity:

- three-post UK team from September 2027: G6 manager, one G5 opportunity-development adviser, one G5 operations/intelligence adviser;
- International G6 + East Asia G5 only; no additional two regional G5s;
- Global Mobility G6 only; no G5 officer;
- international non-pay £35k p.a. from 2027/28;
- one G6 Graduate Transitions Coach from September 2028 under existing leadership.

Financial profile: **£112.842k / £336.870k / £411.660k = £861.372k** over mobilisation; **£421.223k p.a.** annualised `2.2.2` exit run-rate.

Whole Economy case: **£573.042k / £1.092870m / £1.237660m = £2.903572m**. Indicative whole-portfolio operating exposure is approximately **£794k p.a. + TBC**.

### Core `2.2.2`

Canonical workforce model above. Financial profile **£112.842k / £438.932k / £640.777k = £1.192551m**; exit run-rate **£714.058k p.a.**

Whole Core case: **£673.042k / £1.306432m / £1.603277m = £3.582751m**. Indicative whole-portfolio operating exposure approximately **£1.149m p.a. + TBC**.

### Enhanced `2.2.2`

Accelerates capacity:

- both Global Mobility posts from January 2027;
- international non-pay £25k in 2026/27 and £75k p.a. thereafter;
- five-post UK team from September 2027, adding a third G5 opportunity-development adviser to the Core model;
- final two international regional G5s from September 2027 rather than January 2029;
- full G7 + G6 Graduate Transitions team from September 2027 rather than September 2028.

Financial profile: **£148.961k / £708.451k / £791.295k = £1.648707m** over mobilisation; **£791.295k p.a.** annualised `2.2.2` exit run-rate.

Whole Enhanced case: **£759.161k / £1.872451m / £2.220295m = £4.851907m**. Indicative whole-portfolio operating exposure is at least **£1.267m p.a. + TBC**.

The option framing is therefore:

- **Economy:** establish the architecture but constrain coverage and throughput.
- **Core:** sufficient capability to deliver credibly at institutional scale. Recommended.
- **Enhanced:** accelerate market coverage, opportunity-development throughput, Global Mobility and Graduate Transitions alongside a materially larger opportunity and implementation portfolio.

## Early investment requirement

The immediate pre-Business Case requirement remains **£184.153k**: the existing £100k acceleration bridge plus **£84.153k** for international employability continuity. This is already included within the substantive 2026/27 planning profile and must not be added on top.

The January 2027 Global Mobility G6 is protected in all three substantive options but remains outside the immediate bridge. Under Enhanced, the January 2027 Global Mobility G5 and higher Year 1 international non-pay require the substantive option decision.

## Digital boundary

The Digital Student Experience Hub remains a separate institutional investment and must not be rolled into the King’s Edge headline ask. Its current high-water profile remains **£593.360k / £876.296k / £926.296k = £2.395952m**, within a £3m working strategic envelope.

## Other durable resource decisions

`2.4.4 Graduate Premium Engagement, Reputation and Survey Performance` remains the accounting home for the Strategic Partnerships, Profile & External Engagement Fund: **£25k / £35k / £45k**, with a **£45k p.a. BAU planning liability from 2029/30**.

Deliverable `2.3.3` remains deferred. Shared funded resource should not be parked against inactive work.

## Accounting discipline

- Do not double count shared-resource allocations across packages.
- Do not count BAU liabilities inside mobilisation totals.
- Do not count the Student Opportunities Fund award pot inside King’s Edge without a separate approved funding route.
- Do not roll Digital Student Experience Hub costs into the King’s Edge headline ask.
- Distinguish annualised role cost, first-year in-year cash budget and fully mobilised exit run-rate.
- Economy and Enhanced are decision-support overlays until a portfolio decision changes the canonical Core plan.

## Parallel Version 2 structural proposal

Version 1 is preserved as the original four-project plan. Version 2 is a separate six-project working proposal selected by `?plan=v2`. Its stable internal IDs use `v2-` slugs and its authored display numbers run from 2.1 to 2.6. Do not interpret a V2 display number as the same object as that number in V1.

The six V2 projects are Purpose, Capability and Recognition; Experiential Education and Formal Pathways; Opportunity, Partnerships and Transitions; Student Life and Participation; Graduate Futures Insight and Improvement; and Graduate Premium and Reputation. The 16 V1 programme deliverables become 19 V2 deliverables because former 2.2.2 is split into partnership infrastructure, opportunity funding and Graduate Transitions, and former 2.4.4 is split into survey improvement and student/external activation. Graduate Transitions belongs with the opportunity service, while outcomes and survey intelligence sits in the insight project.

`docs/v2-remap-crosswalk.md` explains each boundary and accounting decision. `src/data/v2/crosswalk.json` maps every V1 project, deliverable, step, benefit and measure into V2. The V1 source files, an exact top-level snapshot and the unregistered V2 source parts remain available for provenance. `scripts/validate-v2-crosswalk.mjs` checks preservation of source fields, step outputs, resource asks and shared FTE allocations. Keep this check passing when revising the V2 structure.

The original 2.2.2 Core profile remains £112.842k / £438.932k / £640.777k, and the whole Core mobilisation case remains £3.582751m. In the 2.4.4 split, the combined flexible activation/research/survey envelope and Strategic Partnerships, Profile and External Engagement Fund are each accounted for once by V2 student/external activation. The shared analytics allocation belongs to V2 survey improvement. Do not invent a division of the flexible cash envelope without a funding decision. New Student Opportunities Fund awards remain outside the Edge ask; subject societies remain deferred.

The V2 theory of change is a personal working proposition, not an institutionally approved theory. New cross-functional V2 project owners remain TBC. The existing four-package investment case is retained as an accounting baseline until its narrative is reviewed against the V2 hierarchy.
