# Repository memory and decision log

Background repository memory only. Do not render this document in the app. Do not treat it as programme content. This file exists to help future conversations understand the decisions already made about the repository, the schema and the working process.

This is not a governance artefact for senior leaders. It is a continuity aid for agents and collaborators working with the repository.

## How to use this file

Read this file after `docs/hydration-guide.md`, `docs/working-modes.md` and `docs/deliverable-schema.md` when starting a new chat.

Use it to understand why the repository is structured as it is. Do not assume every decision is permanent. Decisions marked provisional can be revisited if the plan or app needs change.

## Decision status labels

- Settled: proceed on this basis unless the user explicitly reopens it.
- Provisional: use for now, but revisit when the prototype matures.
- Open: known issue or future decision.

## Decisions made

### 1. The repository supports two working modes

Status: Settled

Decision: The project now distinguishes between project manager mode and developer mode.

Rationale: The repository has two different kinds of integrity. The plan itself lives in structured JSON. The website renders that plan. Mixing those modes risks accidental data drift, hard-coded content or cosmetic changes being treated as planning decisions.

Implication: A future chat should confirm the working mode before editing. Project manager mode edits plan data. Developer mode edits rendering.

Affected areas: `docs/working-modes.md`, `src/data/*`, `src/site.jsx`, `public/*.css`.

### 2. Project manager mode is JSON-first

Status: Settled

Decision: In project manager mode, the primary editing surface is JSON data.

Rationale: The mobilisation plan should remain structured, inspectable and portable. The app should render the plan, not become the plan.

Implication: Project manager mode should mainly edit `src/data/kings-edge-plan.json`, `src/data/enabling-projects.json`, `src/data/schema-example-content.json`, `src/data/step-dependencies.json` and `src/data/status.json`. It may read `src/plan-utils.js` to understand normalisation, but should not change app rendering unless explicitly asked.

### 3. Developer mode is rendering-first

Status: Settled

Decision: In developer mode, the primary editing surface is React, CSS, HTML and configuration.

Rationale: UI and UX work should improve how the plan appears and behaves without accidentally changing what the plan says.

Implication: Developer mode should usually avoid changing JSON. If a UI improvement needs a schema change, the agent should pause and explain that the work crosses into schema or project manager mode.

### 4. JSON is the source of truth

Status: Settled

Decision: Plan content should live in JSON, not be hard-coded into React or CSS.

Rationale: The plan needs to remain editable as structured data. Hard-coded content would make future redrafting, validation and rendering inconsistent.

Implication: React components should render fields from the normalised data model. CSS may alter presentation but should not replace plan content except for short decorative UI text.

### 5. Deliverables are the main planning object

Status: Settled

Decision: The deliverable is the main unit where project-management structure is applied.

Rationale: Projects are too broad for detailed mobilisation logic. Steps are too granular. Deliverables are the right level for case for change, benefits, outputs, measures, ownership, dependencies, risks and definition of done.

Implication: Redrafting should happen deliverable by deliverable. Each deliverable should be capable of answering why it exists, what value it creates, what outputs it produces, how it is evidenced and what would count as done.

### 6. Benefits, outputs and measures are distinct

Status: Settled

Decision: The schema separates benefits, outputs and measures.

Rationale: The previous “outputs and KPIs” framing blurred the difference between activity, artefacts, value and evidence. That made the plan harder to defend as a mobilisation plan.

Implication: A framework, dashboard, pack, blueprint or report is usually an output. A clearer student journey, better assurance, stronger evidence, improved adoption or greater confidence is usually a benefit. A measure is the evidence question or indicator that tells us whether a benefit is happening.

### 7. Measures are broader than KPIs

Status: Settled

Decision: The schema uses “measures” rather than “KPIs” as the main concept.

Rationale: Some useful evidence will be quantitative, but much of the early mobilisation work may rely on adoption, coverage, assurance, quality, readiness or confidence evidence. KPI language alone is too narrow.

Implication: Measures should answer a real evidence question. They should not simply prove that a meeting happened or that a document was produced.

### 8. Definition of done sits at deliverable level

Status: Settled

Decision: Each deliverable can have a definition of done.

Rationale: A deliverable is not necessarily complete when an output exists. It may need acceptance, ownership, adoption route, measures, resolved dependencies or a handover route.

Implication: Definition of done should describe when the whole deliverable is delivered, accepted, embedded or ready for handover. Output acceptance criteria remain separate.

### 9. The schema foundation is robust enough for the next phase

Status: Settled for the current prototype

Decision: The current schema foundation is robust enough to support the next substantive content redraft, but one implementation pass is needed first to add planning status, visibility and clearer resource categories to the normalised app model.

Rationale: The schema now carries the core project-management logic: case for change, ownership, maturity, benefits, outputs, measures, definition of done, steps, resources, dependencies, risks, assumptions and decisions. The latest discussions added three refinements that need implementation before the content redraft starts in earnest: pre-draft planning status, visibility/progressive-disclosure handling and clearer resourcing distinctions.

Implication: Do not add a heavy PMO framework yet. Complete the planned schema-plus-rendering update, then test the schema through deliverable-by-deliverable redrafting.

### 10. The schema remains a prototype, not a full PMO control framework

Status: Provisional

Decision: The schema does not yet include full RACI, budget controls, stage gates, change control, detailed milestone tolerances or a formal benefits-realisation register.

Rationale: Adding these now would make the prototype harder to use and slow down content development.

Implication: A future project manager may extend the schema later. For now, use planning maturity, ownership, resources, risks, assumptions and definition of done as a lightweight control layer.

### 11. `src/plan-utils.js` normalises old and new schema fields

Status: Settled

Decision: The app normalises older prototype fields into the richer schema.

Rationale: Existing data should continue to render while richer content is added progressively.

Implication: `problemSolved` can become `caseForChange.problem`, `whatChanges` can become `caseForChange.intendedChange`, `successMeasures.outputs` can become `outputs`, and `successMeasures.kpis` can become `measures`. Project manager mode should prefer the richer fields for new content.

### 12. Out-of-programme projects share the same project shape

Status: Settled

Decision: Out-of-programme projects share the same broad project structure as core Edge projects, but are distinguished by `deliveryContext`.

Rationale: The plan needs to show related and enabling work without creating a separate incompatible object model.

Implication: Rendering and filtering can distinguish Edge and out-of-programme work, but the data model remains coherent.

### 13. Display IDs and underlying IDs are not the same thing

Status: Settled

Decision: Some project display IDs and display titles are applied in `src/plan-utils.js` without changing underlying IDs.

Rationale: The user wanted a revised visible order and naming, while preserving existing IDs and data relationships.

Implication: Do not casually rename underlying IDs. Always check display ID logic before changing identifiers.

### 14. Status pills are currently hidden from most rendering

Status: Provisional

Decision: Status labels remain in data but are hidden visually because they made the interface feel messy at this stage.

Rationale: The current prototype does not yet have sufficiently reliable status data to make prominent status display helpful.

Implication: Do not reintroduce status UI unless asked. Project manager mode may still update `src/data/status.json` if the user wants a more mature delivery-control view later.

### 15. Landing page and visual design decisions are developer-mode territory

Status: Settled

Decision: Landing page copy treatment, header branding, page-title styling, timeline UI and deliverable page visual polish are developer-mode work.

Rationale: These are rendering and presentation decisions, not the core plan schema.

Implication: Project manager mode should not change these unless the user explicitly switches into developer mode.

### 16. All current deliverables are pre-draft until scrutinised

Status: Settled

Decision: Existing deliverables should be treated as pre-draft unless explicitly moved to a later planning status.

Rationale: The current plan content was created as an initial mobilisation map. The next phase is deliverable-by-deliverable scrutiny to move content into draft.

Implication: Future schema and rendering should default to `planningStatus: pre-draft`. Staff-facing views should not imply that pre-draft benefits, measures, resources or timelines are approved plans.

### 17. Planning status is different from planning maturity

Status: Settled

Decision: Use planning status for the visible staff-facing stage, and planning maturity for internal nuance.

Rationale: Planning status answers how settled the plan is. Planning maturity answers what kind of planning work is happening. Combining them would make the app less clear.

Implication: Recommended planning-status values are `pre-draft`, `draft`, `validated-draft`, `decision-ready`, `mobilising` and `in-delivery`. Planning maturity can retain values such as concept, scoping, shaping and validated.

### 18. Reveal detailed plan is progressive disclosure, not security

Status: Settled

Decision: The deliverable page should use a “Reveal detailed plan” pattern, but this must not be treated as a security mechanism.

Rationale: If data is included in the client-side bundle, it is not genuinely protected by a reveal button, CSS or front-end filtering.

Implication: Revealed detail can contextualise pre-draft planning, but genuinely restricted material should not be shipped in a broad staff-facing app unless real access control or separate builds exist.

### 19. Resourcing must distinguish existing capacity, new investment and enabling conditions

Status: Settled

Decision: Resource modelling should separate existing capacity to align, new cash investment and enabling conditions.

Rationale: Senior leaders need to distinguish between prioritising existing capacity and approving genuine new spend, especially where a strategic investment fund bid may be needed.

Implication: Future schema should support `existingCapacity`, `newInvestment`, `enablingConditions`, `fundingSummary` and `investmentAsk`. Existing fields such as people, cashCosts and nonCashNeeds should be backwards-compatible but mapped into the clearer structure.

### 20. Measures and Timeline views must respect planning status

Status: Settled

Decision: Measures and Timeline views should not present pre-draft assumptions as approved KPIs or live delivery plans.

Rationale: Cross-cutting views can unintentionally make early planning look more settled than it is.

Implication: Pre-draft measures should be hidden from the main Measures view or clearly labelled as emerging. Pre-draft timeline items should be visually indicative. Draft, decision-ready and in-delivery items can be shown with increasing confidence.

### 21. Visibility classification is handling guidance, not access control

Status: Settled

Decision: The schema may use visibility values such as staff-visible, internal-planning and restricted, but these describe handling and rendering intent, not true security.

Rationale: The app currently has no authentication or secure server-side filtering. Visibility is useful for presentation discipline, but cannot protect sensitive content by itself.

Implication: Restricted material should either be omitted from broad app data, held separately, or rendered only in a properly controlled build.

## Current working assumptions

- The next major task is a schema-plus-rendering update for planning status, visibility, resource categories and reveal detailed plan.
- The next content task is a deliverable-by-deliverable redraft to move items from pre-draft to draft.
- The plan should remain senior-leadership ready: clear, concise, defensible and not over-bureaucratic.
- Benefits should be written as realised value, not disguised outputs.
- Measures should test whether benefits are happening, not merely count activity.
- Uncertainty should be visible through planning status, maturity, assumptions, decisions and TBC fields.
- Resource asks should distinguish existing capacity, new investment and enabling conditions.
- The app is a prototype and should remain flexible.
- Future PM input may later formalise RACI, controls, budgets and benefits realisation.

## Known cautions for future agents

- Do not confuse documentation in `docs/` with programme content.
- Do not render this file in the app.
- Do not hard-code plan text into React or CSS.
- Do not edit JSON in developer mode unless explicitly asked.
- Do not edit React or CSS in project manager mode unless explicitly asked.
- Do not rename IDs without checking routing, dependencies, display IDs and timeline references.
- Do not assume every TBC is a weakness. Some TBCs are honest planning maturity markers.
- Do not treat reveal controls, filters or CSS as security.
- Do not put genuinely restricted content into broad client-side JSON.
- Do not present pre-draft measures as approved KPIs.
- Do not present pre-draft timeline items as firm delivery commitments.
