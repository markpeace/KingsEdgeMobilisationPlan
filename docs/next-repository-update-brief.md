# Next repository update brief

Background planning document. Do not render this file in the app. This file compiles the repository changes now needed after the latest schema, resourcing, planning-status and visibility discussions.

The purpose is to leave the repository in a state where a future chat can pick up the next implementation phase without reconstructing the conversation.

## Executive summary

The next repository update should align four things:

1. Project definition and workflow: all current deliverables start as pre-draft and move through scrutiny to draft.
2. Schema: add explicit fields for planning status, visibility, resource type and investment ask.
3. App rendering: show a staff-safe summary by default, with detailed project-management content behind a clear reveal pattern.
4. Prompts and docs: keep project manager mode and developer mode aligned with these rules.

The core principle is transparency without overclaiming. The app can show staff that real mobilisation planning is underway, while making clear what is pre-draft, what is draft, what is decision-ready and what is live.

## 1. Project definition changes

### 1.1 Treat all current deliverables as pre-draft

Current plan content should be treated as pre-draft until each deliverable has been scrutinised against the richer schema.

Pre-draft means:

- the deliverable is included in the mobilisation map;
- the content has not yet completed detailed planning scrutiny;
- detailed fields are working assumptions;
- resources, measures, risks, issues and investment implications must not be presented as settled commitments.

### 1.2 Use deliverable-level scrutiny as the route to draft

A deliverable should only move from pre-draft to draft once these areas have been reviewed:

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

### 1.3 Use decision-ready as a meaningful gate

A deliverable should only become decision-ready when it is mature enough for a decision about priority, ownership, resourcing, investment, sequencing or mobilisation.

Decision-ready should not mean perfect. It should mean good enough for a senior decision.

## 2. Schema changes required

### 2.1 Add planning status

Add a controlled deliverable-level field, recommended name: `planningStatus`.

Recommended values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Do not use freeform tags for this. This is a controlled planning-status field, not a thematic tag.

The app may still describe this visually as a planning-stage tag.

Default for all existing deliverables: `pre-draft`.

### 2.2 Retain planning maturity as a secondary internal nuance

Keep `planningMaturity` for internal planning nuance if useful, but distinguish it from `planningStatus`.

Suggested distinction:

- `planningStatus`: how settled the plan is and how it should be presented.
- `planningMaturity`: what kind of planning work is happening internally.

Examples:

- `planningStatus: pre-draft`, `planningMaturity: concept`
- `planningStatus: draft`, `planningMaturity: shaping`
- `planningStatus: decision-ready`, `planningMaturity: validated`

### 2.3 Add visibility classification

Add a lightweight visibility model. Recommended deliverable-level field: `visibility`.

Recommended values:

- `staff-visible`
- `internal-planning`
- `restricted`

This is not true security. It is presentation and handling guidance.

Important rule: if content is genuinely sensitive, it should not be shipped in the client-side app data unless there is real access control or a separate restricted build.

### 2.4 Add section-level visibility where needed

Some detailed fields may need their own visibility or display rules. Recommended optional field on benefits, outputs, measures, resources, risks, issues, assumptions and decisions: `visibility`.

Default: inherit from deliverable or use `internal-planning` for detailed plan fields.

Use `restricted` only for material that should not appear in a broad staff-facing build.

### 2.5 Upgrade resource schema

The resource model should distinguish existing capacity from new investment.

Recommended `resources` structure:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`
- `fundingSummary`
- `investmentAsk`

Existing capacity means capacity, expertise, governance time, data access, digital input or staff effort that already exists but must be aligned, prioritised or redirected.

New investment means genuine additional cash, including strategic investment fund bids, fixed-term roles, consultancy, digital build, external evaluation, incentives, events or tooling.

Enabling conditions means non-cash dependencies such as governance routes, data access, system integration, faculty participation, employer/alumni access or roadmap prioritisation.

### 2.6 Add investment ask where needed

For deliverables with genuine new cash needs, add an investment ask.

Recommended fields:

- `required`: true or false;
- `fundingRoute`: for example strategic investment fund;
- `priority`: low, medium, high or critical;
- `decisionNeededBy`;
- `totalEstimatedCash`;
- `confidence`;
- `rationale`;
- `whatItUnlocks`;
- `consequenceIfUnfunded`;
- `minimumViableOption`;
- `fullMobilisationOption`.

This will let the plan distinguish between a prioritisation ask and a cash investment ask.

## 3. App rendering changes required

### 3.1 Add staff-safe default deliverable view

Deliverable pages should default to a staff-safe summary rather than showing every project-management field immediately.

Default visible content should include:

- title;
- summary;
- planning status tag;
- project;
- accountable owner or delivery lead where known;
- case for change;
- intended change;
- current planning focus;
- next scrutiny step or next decision.

### 3.2 Add “Reveal detailed plan”

Detailed project-management sections should sit behind a reveal control on deliverable pages.

Recommended button label:

- Reveal detailed plan

Detailed revealed sections:

- benefits;
- outputs and acceptance criteria;
- measures and evidence questions;
- definition of done;
- resources;
- investment ask;
- dependencies;
- risks;
- issues;
- assumptions;
- decisions;
- detailed delivery steps.

### 3.3 Add pre-draft contextual warning

When a deliverable is pre-draft, the detailed plan reveal should show a clear contextual note:

This deliverable is currently pre-draft. Detailed planning fields are working assumptions and will be refined through deliverable-level scrutiny.

This note is not a warning of weakness. It is a transparency marker.

### 3.4 Do not treat reveal as security

Reveal controls are progressive disclosure only. They do not secure data.

If material is genuinely restricted, the safest options are:

- keep it out of the broad staff-facing data bundle;
- keep it in separate restricted JSON not imported into the public app;
- create a separate internal/restricted build;
- later introduce authentication if needed.

### 3.5 Update Measures view

Measures view should respect planning status and visibility.

Recommended behaviour:

- Pre-draft: hide from main measures view by default or show as emerging measures.
- Draft: show as draft measures with confidence and missing-data gaps visible.
- Validated draft and above: show more confidently, but still indicate baseline, target and data-source maturity.
- Decision-ready and above: missing baselines, data sources or owners should be visible as planning gaps.

Avoid presenting pre-draft measures as final KPIs.

### 3.6 Update Timeline view

Timeline should also respect planning status.

Recommended behaviour:

- Pre-draft: show only indicative phases or high-level milestones, visibly labelled as indicative.
- Draft: show delivery steps and dependencies as draft planning assumptions.
- Decision-ready and above: show sequencing and dependencies with more confidence.
- Mobilising and in-delivery: timeline becomes a live delivery-management view.

Do not let the timeline flatten pre-draft assumptions and live delivery into the same visual language.

### 3.7 Update project and deliverable cards

Cards should show the planning status tag prominently.

Recommended card treatment:

- Pre-draft: calm, clear, non-alarming tag.
- Draft: indicates structured plan exists but is not approved.
- Validated draft: indicates tested with owners or contributors.
- Decision-ready: indicates ready for prioritisation or approval.
- Mobilising / In delivery: indicates live movement.

Avoid red/amber/green at this stage. The purpose is maturity, not performance status.

## 4. Documentation and prompt changes required

### 4.1 Update `docs/deliverable-schema.md`

Add sections for:

- planning status;
- visibility and display handling;
- resource distinction;
- investment ask;
- relationship between planning status and measures/timeline rendering.

### 4.2 Update `docs/working-modes.md`

Project manager mode should explicitly check:

- whether content is pre-draft, draft or decision-ready;
- whether resource needs are existing capacity, new investment or enabling conditions;
- whether sensitive material is being put into app-shipped JSON;
- whether fields should be staff-visible, internal planning or restricted.

Developer mode should explicitly check:

- whether rendering implies false maturity;
- whether reveal is being mistaken for security;
- whether measures or timeline views need maturity-based display rules.

### 4.3 Update `docs/hydration-guide.md`

Add a hydration reminder that future agents must read this update brief and repository memory before making schema or rendering changes.

### 4.4 Update `docs/repository-memory.md`

Record the durable decisions:

- all current deliverables are pre-draft until scrutinised;
- planning status is different from planning maturity;
- reveal is progressive disclosure, not security;
- resource schema must separate existing capacity, new investment and enabling conditions;
- measures and timeline should respect planning maturity/status;
- restricted content should not be shipped in a broad client-side app build.

## 5. Recommended implementation order

### Phase 1: Documentation alignment

Update docs first so future chats understand the intended change before implementation.

Files:

- `docs/next-repository-update-brief.md`
- `docs/deliverable-schema.md`
- `docs/working-modes.md`
- `docs/hydration-guide.md`
- `docs/repository-memory.md`

### Phase 2: Schema normalisation

Update `src/plan-utils.js` to normalise:

- `planningStatus`, defaulting to `pre-draft`;
- `visibility`, defaulting to `staff-visible` for summary and `internal-planning` for detailed planning fields;
- enhanced `resources` structure;
- investment ask fields.

Preserve backwards compatibility with existing `people`, `cashCosts`, `nonCashNeeds`, `fundingStatus` and `resourceSummary` fields.

### Phase 3: Data migration

Set all existing deliverables to `planningStatus: pre-draft` or let normalisation default them to pre-draft.

Migrate existing resource examples from:

- `people` to `existingCapacity`;
- `cashCosts` to `newInvestment`;
- `nonCashNeeds`, governance and data needs to `enablingConditions`.

### Phase 4: App rendering

Update deliverable pages, cards, Measures view and Timeline view.

Rendering priorities:

- visible planning-status tag;
- default staff-safe summary;
- reveal detailed plan;
- pre-draft detail notice;
- measures and timeline display rules;
- resourcing split between existing capacity, new investment and enabling conditions.

### Phase 5: Content redraft workflow

Begin deliverable-by-deliverable scrutiny.

For each deliverable:

1. Confirm case for change.
2. Confirm owner and delivery lead.
3. Draft benefits.
4. Draft outputs and acceptance criteria.
5. Draft measures and evidence questions.
6. Split resource needs into existing capacity, new investment and enabling conditions.
7. Identify risks, issues, assumptions and decisions.
8. Define done.
9. Move from pre-draft to draft only when scrutiny is complete.

## 6. Risks to manage

### Risk: overbuilding the schema before content is ready

Mitigation: Add only the fields needed to support honest mobilisation and staff-facing clarity.

### Risk: false security through reveal controls

Mitigation: Do not put genuinely restricted material into broad client-side JSON.

### Risk: timeline looks more settled than the plan really is

Mitigation: Make pre-draft timeline items visibly indicative.

### Risk: measures look like approved KPIs

Mitigation: Use “measures” and “emerging measures” language, not KPI language, until decision-ready.

### Risk: resourcing looks like a single undifferentiated ask

Mitigation: Separate existing capacity, new investment and enabling conditions.

## 7. Next practical move

The next implementation task should be a schema-plus-rendering update:

- normalise `planningStatus`, `visibility`, and resource categories in `src/plan-utils.js`;
- update deliverable page rendering to show staff-safe summary plus reveal detailed plan;
- update Measures and Timeline views to respect planning status;
- keep all current deliverables pre-draft by default.

Only after that should the content redraft begin in earnest.
