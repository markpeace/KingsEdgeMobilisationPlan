# Deliverable schema reference

This document describes the working deliverable schema for the King's Edge Mobilisation Plan. The schema is designed to support a credible mobilisation plan without becoming too bureaucratic for the current prototype.

The key principle is that each deliverable should be understandable as a project-management object: why it exists, who owns it, what value it creates, what it produces, how it is evidenced, what it needs and what would count as done.

Current planning assumption: all existing deliverables should be treated as pre-draft until each one has been scrutinised against this schema.

## Core deliverable fields

Each deliverable should be able to carry the following fields.

### Identity

- `id`: stable machine-readable identifier, such as `2.2.1`.
- `title`: public title.
- `summary`: short explanation used on cards and detail pages.
- `tags`: optional thematic tags. Do not use tags for planning status.

IDs should not be changed casually. They are used for routing, display references, dependencies and timeline relationships.

## Planning status and maturity

Planning status and planning maturity are related but different.

### Planning status

Recommended field: `planningStatus`

Purpose: the staff-facing planning-stage tag. It answers how settled the plan is and how confidently it should be presented.

Recommended values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Default for existing deliverables: `pre-draft`.

Meanings:

- `pre-draft`: included in the mobilisation map, but not yet scrutinised against the full schema.
- `draft`: reviewed against the schema and coherent as a planning object, but not approved.
- `validated-draft`: checked with relevant owners, contributors or stakeholders.
- `decision-ready`: mature enough for a decision about priority, investment, ownership, sequencing or mobilisation.
- `mobilising`: relevant decision made and delivery is being organised.
- `in-delivery`: work is actively underway.

A deliverable should only move from pre-draft to draft after case for change, ownership, benefits, outputs, measures, definition of done, steps, dependencies, resources, risks, assumptions and decisions have been scrutinised.

### Planning maturity

Field: `planningMaturity`

Purpose: internal planning nuance. It describes the kind of planning work underway, not the public settledness of the plan.

Suggested values:

- `concept`
- `scoping`
- `shaping`
- `validated`
- `mobilising`
- `in delivery`
- `embedded`

Use maturity honestly. A well-labelled immature deliverable is better than a falsely settled one.

Examples:

- `planningStatus: pre-draft`, `planningMaturity: concept`
- `planningStatus: draft`, `planningMaturity: shaping`
- `planningStatus: decision-ready`, `planningMaturity: validated`

## Visibility and display handling

Visibility is presentation guidance, not true access control.

Recommended deliverable-level field: `visibility`

Recommended values:

- `staff-visible`
- `internal-planning`
- `restricted`

Recommended use:

- `staff-visible`: safe for broad staff-facing summary views.
- `internal-planning`: suitable for internal planning audiences, but should be contextualised as draft or pre-draft where appropriate.
- `restricted`: should not be included in a broad client-side app bundle unless access is genuinely controlled or a separate restricted build is used.

Important rule: a reveal button is not security. If sensitive material is present in the front-end data bundle, it should be treated as visible to anyone with access to that build.

Optional section-level field: `visibility`

This may be added to benefits, outputs, measures, resources, risks, issues, assumptions and decisions where needed. Default behaviour should usually be:

- summary and case for change: staff-visible;
- benefits, outputs, measures and steps: internal-planning until draft or validated;
- investment ask, sensitive risks or unresolved issues: restricted if not suitable for broad staff audiences.

## Case for change

Field: `caseForChange`

Purpose: explains why the deliverable exists.

Subfields:

- `problem`: the problem, gap or need.
- `opportunity`: what becomes possible if this work is done well.
- `whyNow`: why this matters now, including external or institutional urgency.
- `intendedChange`: the change this deliverable is expected to create.

Backwards compatibility:

- `problemSolved` is normalised into `caseForChange.problem`.
- `whatChanges` is normalised into `caseForChange.intendedChange`.

Good case-for-change writing should be direct, specific and senior-leadership ready. Avoid vague claims such as “improves student experience” unless the mechanism is clear.

## Ownership

Field: `ownership`

Purpose: separates accountability, delivery and benefit realisation.

Subfields:

- `accountableOwner`: senior owner accountable for the deliverable.
- `deliveryLead`: person or role leading the work.
- `benefitOwner`: person or role accountable for realising the benefit after outputs are produced.
- `contributors`: teams, roles or groups involved.
- `decisionForum`: forum where decisions or escalations should go.

The older `lead` field is still used and is normalised into `ownership.deliveryLead` when needed.

## Benefits, outputs and measures

These fields are deliberately separate.

### Benefits

Field: `benefits`

Benefits describe the value realised when outputs are used. They are not tasks and not documents.

Useful subfields:

- `id`: stable benefit ID, such as `2.2.1-B1`.
- `title`: short benefit name.
- `beneficiary`: who benefits.
- `benefitType`: type of value, such as student agency, assurance, adoption, operating model, inclusion, evidence or strategic value.
- `statement`: plain-language benefit statement.
- `currentState`: current problem or baseline state.
- `desiredChange`: what should be different.
- `owner`: benefit owner.
- `realisationPeriod`: when the benefit is expected to land.
- `realisedThrough`: output IDs that enable the benefit.
- `measures`: measure IDs that evidence the benefit.
- `visibility`: optional handling classification.

A benefit should usually answer: “what value exists because this deliverable has been used, adopted or embedded?”

### Outputs

Field: `outputs`

Outputs are tangible things produced by the work.

Useful subfields:

- `id`: stable output ID, such as `2.2.1-O1`.
- `title`: output name.
- `type`: output type, such as framework, blueprint, report, dashboard, template, operating model, evidence pack or pilot.
- `description`: what the output is.
- `owner`: owner of the output.
- `duePeriod`: expected delivery period.
- `supportsBenefits`: benefit IDs supported by this output.
- `acceptanceCriteria`: criteria for accepting the output as complete.
- `visibility`: optional handling classification.

Outputs should have acceptance criteria wherever possible. A document existing is rarely enough. The output should be accepted, usable and connected to adoption or benefit realisation.

### Measures

Field: `measures`

Measures answer evidence questions. KPI is one possible type of measure, but this schema uses the broader term because some useful evidence will be qualitative, adoption-based, assurance-based or readiness-based.

Useful subfields:

- `id`: stable measure ID, such as `2.2.1-M1`.
- `title`: measure name.
- `measureType`: type of measure, such as reach, adoption, quality, coverage, assurance, operational readiness or impact.
- `questionAnswered`: the evidence question the measure answers.
- `baseline`: current state, if known.
- `target`: desired level or direction of change.
- `measure`: how the thing is measured.
- `dataSource`: where the evidence comes from.
- `cadence`: review frequency or moment.
- `owner`: person or role responsible for the measure.
- `confidence`: maturity or confidence in the measure.
- `supportsBenefits`: benefit IDs supported by this measure.
- `visibility`: optional handling classification.

Good measures do not only prove that activity happened. They should help show whether the intended benefit is happening.

Measures view should respect planning status. Pre-draft measures should be treated as emerging measures, not approved KPIs.

## Definition of done

Field: `definitionOfDone`

Purpose: describes when the deliverable as a whole can be considered delivered, accepted or ready for handover.

A strong definition of done may include:

- outputs delivered and accepted;
- benefit owner confirmed;
- measures agreed and baselined where possible;
- dependencies resolved or actively managed;
- adoption or business-as-usual route agreed;
- decisions made or escalated;
- resource implications understood.

Definition of done is different from output acceptance criteria. Output acceptance criteria apply to individual artefacts. Definition of done applies to the whole deliverable.

## Delivery steps

Fields: `steps` and `deliverySteps`

The app currently renders `steps`, while `plan-utils.js` also creates `deliverySteps` as part of the richer schema normalisation.

Useful subfields:

- `id`: stable step ID.
- `title`: step title.
- `stepType`: task, milestone, decision, pilot, launch, review or scale decision.
- `period`: period ID used by the timeline.
- `summary`: concise description.
- `dependsOn`: step or deliverable IDs this step depends on.
- `outputsProduced`: output IDs produced or advanced by the step.
- `outputs`: step-level outputs, if useful.
- `resources`: step-level resources.
- `decisions`: step-level decisions.
- `risks`: step-level risks.
- `issues`: step-level issues.
- `assumptions`: step-level assumptions.
- `visibility`: optional handling classification.

Steps should be sequenced enough to support the timeline. They do not need to become a full task plan.

Timeline view should respect planning status. Pre-draft steps should be visually framed as indicative, not live delivery commitments.

## Resources

Field: `resources`

Resources need to distinguish existing capacity from genuine new cash investment.

Recommended resource structure:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`
- `fundingSummary`
- `investmentAsk`

### Existing capacity

Field: `existingCapacity`

Purpose: capacity, expertise, governance time, data access, digital input or staff effort that already exists but must be aligned, prioritised or redirected.

Useful subfields:

- `role` or `team`;
- `contribution`;
- `estimatedEffort` or `fte`;
- `periodNeeded`;
- `sourceTeam`;
- `owner`;
- `confidence`;
- `opportunityCost`;
- `riskIfUnavailable`.

This is not “free” resource. It has opportunity cost, but it is not a new cash ask.

### New investment

Field: `newInvestment`

Purpose: genuine additional cash needed to mobilise the work.

Useful subfields:

- `item`;
- `category`;
- `amount`;
- `currency`;
- `period`;
- `recurrence`;
- `fundingRoute`;
- `confidence`;
- `rationale`;
- `whatItUnlocks`;
- `consequenceIfUnfunded`.

Use this for strategic investment fund asks, fixed-term posts, consultancy, digital build, student incentives, external evaluation, tooling, events or paid research support.

### Enabling conditions

Field: `enablingConditions`

Purpose: non-cash conditions needed for delivery.

Examples:

- data access;
- governance route;
- digital roadmap prioritisation;
- faculty participation;
- employer or alumni access;
- policy approval;
- system integration;
- communications support.

Useful subfields:

- `condition`;
- `owner`;
- `dependencyType`;
- `criticality`;
- `periodNeeded`;
- `riskIfMissing`.

### Investment ask

Field: `investmentAsk`

Purpose: senior-facing summary of whether new funding is needed and what it unlocks.

Useful subfields:

- `required`: true or false;
- `fundingRoute`;
- `priority`;
- `decisionNeededBy`;
- `totalEstimatedCash`;
- `currency`;
- `confidence`;
- `rationale`;
- `whatItUnlocks`;
- `consequenceIfUnfunded`;
- `minimumViableOption`;
- `fullMobilisationOption`.

The schema should make it clear whether the ask is a prioritisation of existing resource, a new cash investment, an enabling-condition dependency, or some combination.

### Backwards compatibility for resources

The app currently also supports older resource fields:

- `people`
- `cashCosts`
- `dataAndSystems`
- `governance`
- `engagementNeeds`
- `nonCashNeeds`
- `fundingStatus`
- `resourceSummary`

Future normalisation should preserve these while mapping them into the clearer resource categories where possible:

- `people` -> `existingCapacity`
- `cashCosts` -> `newInvestment`
- `dataAndSystems`, `governance`, `engagementNeeds`, `nonCashNeeds` -> `enablingConditions`

## Dependencies

Field: `dependencies`

Dependencies should be typed where possible.

Useful subfields:

- `id`: dependency ID.
- `dependsOn` or `targetId`: the thing depended on.
- `dependencyType`: data, decision, resource, sequencing, stakeholder, system, governance or input.
- `criticality`: high, medium or low.
- `description`: plain-language explanation.
- `owner`: owner of the dependency.
- `status`: open, managed or resolved.

Dependencies should not just be lists of links. They should explain what kind of dependency exists and why it matters.

## RAID-style fields

The schema supports lightweight RAID-style planning.

### Risks

Risks are things that may happen and would affect delivery or benefit realisation.

Useful fields: `title`, `likelihood`, `impact`, `mitigation`, `owner`, `visibility`.

### Issues

Issues are current problems that need action.

Useful fields: `title`, `status`, `actionRequired`, `owner`, `visibility`.

### Assumptions

Assumptions are things being treated as true for planning purposes but not yet fully validated.

Useful fields: `title`, `statement`, `confidence`, `validationNeeded`, `visibility`.

### Decisions

Decisions capture choices that need to be made.

Useful fields: `title`, `decisionNeededBy`, `decisionMaker`, `options`, `recommendation`, `visibility`.

## Normalisation in the app

The normalisation logic lives in `src/plan-utils.js`. It allows old and new data to render together while the prototype evolves.

Important behaviours:

- project IDs may have display IDs applied;
- project titles may have display titles applied;
- deliverable display IDs are derived from project display IDs;
- older success-measure fields are normalised into the new outputs and measures model;
- missing benefits can be inferred from `whatChanges` as a fallback;
- missing definitions of done can be given a lightweight fallback.

Future normalisation should add:

- default `planningStatus: pre-draft`;
- default staff-safe visibility for summary fields;
- internal-planning visibility for detailed project-management fields;
- resource mapping from older fields into existing capacity, new investment and enabling conditions.

Project manager mode should understand this normalisation, but should prefer adding richer fields directly to the JSON rather than relying on fallbacks.

## Rendering implications

Deliverable pages should show a staff-safe summary first, then allow users to reveal detailed planning.

Recommended default view:

- title;
- summary;
- planning status tag;
- project;
- accountable owner or delivery lead where known;
- case for change;
- intended change;
- current planning focus;
- next scrutiny step or next decision.

Recommended revealed detail:

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

For pre-draft deliverables, the revealed detail should carry clear context: detailed planning fields are working assumptions and will be refined through deliverable-level scrutiny.

## Editing principles

When editing deliverable JSON:

- keep valid JSON;
- preserve IDs unless explicitly migrating them;
- do not mix benefits, outputs and measures;
- make ownership visible;
- make uncertainty visible;
- keep senior-facing copy concise;
- avoid decorative language that does not help delivery;
- use acceptance criteria to clarify what done means;
- use measures to test benefits, not just activity;
- separate existing capacity, new investment and enabling conditions;
- do not put genuinely restricted material into broad client-side app data;
- ensure any schema change is reflected in rendering if needed.
