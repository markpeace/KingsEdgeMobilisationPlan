# Deliverable schema reference

This document describes the canonical project and deliverable model for the King's Edge Mobilisation Plan.

The model is deliberately compact. A deliverable should answer five questions:

1. Why does it exist?
2. Who owns it?
3. What value should it create?
4. How will it be delivered?
5. What evidence will show that the value is being realised?

The Delivery timeline is the source of truth for operational delivery. Do not create parallel whole-deliverable sections that repeat the timeline.

## Canonical planning-stage workflow

Use `planningStatus` as the only planning-stage field.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Meanings:

- `pre-draft`: included in the mobilisation map, but not yet scrutinised against the canonical model.
- `draft`: coherent as a planning object, but not approved.
- `validated-draft`: checked with relevant owners, contributors or stakeholders.
- `decision-ready`: mature enough for a decision about priority, investment, ownership, sequencing or mobilisation.
- `mobilising`: the relevant decision has been made and delivery is being organised.
- `in-delivery`: work is actively underway.

A deliverable should normally move from `pre-draft` to `draft` only after its case for change, ownership, benefits, measures, delivery steps, step-level resource asks and material risks have been scrutinised.

Do not use `tags`, `planningMaturity`, `visibility` or `src/data/status.json` as the planning-stage workflow.

## Project fields

Each project should be able to carry:

- `id`
- `title`
- `owner`
- `summary`
- `detailSummary`
- `transformationClaim`
- `deliveryContext`
- `deliverables`

Use `deliveryContext: "edge"` for King's Edge projects and `deliveryContext: "out-of-programme"` for related delivery projects outside the programme boundary.

## Core deliverable fields

Canonical deliverable fields:

- `id`: stable identifier, for example `2.1.1`.
- `title`: public title.
- `lead`: delivery lead.
- `summary`: concise card-facing proposition.
- `detailSummary`: fuller detail-page explanation.
- `planningStatus`: canonical planning stage.
- `caseForChange`: problem, opportunity, why now and intended change.
- `ownership`: accountable owner, delivery lead, benefit owner, contributors and decision forum.
- `benefits`: value expected from use of the deliverable.
- `measures`: evidence used to test whether benefits are being realised.
- `steps`: the sequenced delivery route.
- `risks`, `issues`, `assumptions`: optional whole-route planning concerns where they genuinely affect the whole deliverable.

The following older fields are no longer part of the canonical deliverable model and should not be authored for new or revised deliverables:

- `components`
- `definitionOfDone`
- deliverable-level `dependencies`
- deliverable-level `decisions`
- deliverable-level `resources`

Existing legacy values may remain readable in old source data, but the deliverable detail view does not present them as independent sections.

## Case for change

Field: `caseForChange`

Subfields:

- `problem`
- `opportunity`
- `whyNow`
- `intendedChange`

Backwards-compatible aliases:

- `problemSolved` maps to `caseForChange.problem`.
- `whatChanges` maps to `caseForChange.intendedChange`.

## Ownership

Field: `ownership`

Subfields:

- `accountableOwner`
- `deliveryLead`
- `benefitOwner`
- `contributors`
- `decisionForum`

Use `decisionForum` to identify where a material escalation or approval should go. Do not create a separate whole-deliverable decision list.

## Benefits and measures

Benefits describe value realised through use. They are not tasks, products or documents.

Recommended benefit fields:

- `id`
- `title`
- `statement`
- `beneficiary`
- `benefitType`
- `realisationPeriod`
- `successLooksLike`
- `enabledBy`

Measures are authored once at deliverable level and linked to benefits using `supportsBenefits`.

Recommended measure fields:

- `id`
- `title`
- `supportsBenefits`
- `questionAnswered`
- `measure`
- `baseline`
- `target`
- `owner`
- `cadence`
- `confidence`

The app presents linked measures under the reader-facing heading `How we will know`.

Do not create a second authored `evidenceOfSuccess` list when the same evidence is already represented by linked measures.

See `docs/value-and-evidence-model.md` for the full benefits-realisation model.

## Delivery steps

The Delivery timeline owns the operational plan.

Each step should normally include:

- `id`
- `title`
- `period`
- `summary`
- `dependsOn`

Optional step fields:

- `outputs`
- `resources`
- `decisions`
- `risks`
- `issues`
- `assumptions`

Use step-level fields for anything that changes how a specific piece of work happens.

### Outputs and products

Products and outputs belong on the step that creates them.

A step output may include:

- `id`, where a stable reference is useful;
- `title`;
- `summary` or `description`;
- `type`;
- `owner`;
- `acceptanceCriteria` or other completion evidence.

Completion evidence belongs with the relevant output or step. Do not maintain a separate whole-deliverable `definitionOfDone` section.

### Dependencies and handoffs

Use step-level `dependsOn` for all sequencing and handoffs, including dependencies on steps in another deliverable.

```json
"dependsOn": ["2.1.1-step-2", "2.4.1-step-1"]
```

The timeline and dependency views derive relationships from step IDs. Do not duplicate them in a deliverable-level dependency list.

### Decisions

Put a decision on the step that it gates, changes or completes.

Use the deliverable ownership `decisionForum` for the escalation route. Do not create a separate whole-deliverable decisions section.

### Timing

Visible timeline buckets run from `jul-dec-2026` to `jul-dec-2030`. Each bucket contains hidden `a`, `b` and `c` thirds.

A step within one bucket can use:

```json
"period": "jul-dec-2026:ab"
```

A step crossing a boundary can use:

```json
"period": {
  "start": "jul-dec-2026:c",
  "end": "jan-jun-2027:ab"
}
```

## Step resource asks

All resource demand belongs on the step that needs it.

Use three canonical groups:

- `existingCapacity`: existing people, expertise or operational capacity that must be aligned or protected;
- `newInvestment`: additional cash or funded capacity required for the step;
- `enablingConditions`: non-cash conditions such as data access, governance agreement, roadmap priority or faculty participation.

A resource ask should normally state:

- the role, item or condition;
- why it is needed;
- the owner or source team where known;
- the period needed, when it differs from the parent step period;
- the decision deadline where relevant;
- cost or estimate for new investment where known;
- confidence;
- the delivery risk if the ask is not met.

Example:

```json
"resources": {
  "newInvestment": [
    {
      "id": "2.1.1-step-1-resource-investment-1",
      "item": "Summer student placement",
      "amount": 3000,
      "currency": "GBP",
      "owner": "Careers and Employability Service",
      "decisionNeededBy": "Summer 2026",
      "confidence": "estimate",
      "rationale": "Supports data preparation, visualisation development and early testing.",
      "riskIfMissing": "The first pack may not be ready for September testing."
    }
  ]
}
```

When `periodNeeded` is omitted, the app uses the parent step period.

The app derives a `Resource and investment profile` from all step asks. That profile sequences capacity, investment and enabling conditions by step and period. It is a roll-up, not a second authored resource plan.

See `src/data/step-resource.schema.json` for the authoring schema.

Backwards-compatible aliases remain readable while legacy data is migrated:

- `people` maps to `existingCapacity`;
- `cashCosts` maps to `newInvestment`;
- `dataAndSystems`, `governance`, `engagementNeeds` and `nonCashNeeds` map to `enablingConditions`.

## Risks, issues and assumptions

Default to the step level.

Keep a risk, issue or assumption at deliverable level only when it materially affects the whole route or benefit realisation and cannot sensibly be attached to one step.

Do not duplicate the same item at both levels.

## Authoring discipline

Prefer the smallest useful model:

- value belongs in benefits;
- evidence belongs in linked measures;
- products and completion evidence belong in timeline outputs;
- sequencing and handoffs belong in `dependsOn`;
- decisions belong on the step they gate;
- resource asks belong on the step that needs them;
- the resource profile is derived from those asks;
- RAID belongs at the most local useful level.

The deliverable detail page should remain a clear route through case for change, benefits and evidence, delivery timeline, governance, the derived resource profile and material planning risks. It should not become a collection of parallel planning taxonomies.
