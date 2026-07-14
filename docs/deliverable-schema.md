# Deliverable schema reference

This document describes the canonical project and deliverable model for the King's Edge Mobilisation Plan.

The model is deliberately compact. A deliverable should answer five questions:

1. Why does it exist?
2. Who is accountable for it?
3. What value should it create?
4. How will it be delivered?
5. What evidence will show that the value is being realised?

The Delivery timeline is the source of truth for operational delivery. Do not create parallel whole-deliverable sections that repeat it.

## Canonical planning-stage workflow

Use `planningStatus` as the only planning-stage field.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

A deliverable should normally move from `pre-draft` to `draft` only after its case for change, ownership, benefits, measures, governance, delivery steps, resources and material risks have been scrutinised.

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

- `id`: stable identifier, for example `2.1.1`;
- `title`: public title;
- `lead`: delivery lead;
- `summary`: concise card-facing proposition;
- `detailSummary`: fuller detail-page explanation;
- `planningStatus`: canonical planning stage;
- `caseForChange`: problem, opportunity, why now and intended change;
- `ownership`: accountable owner and delivery lead;
- `governance`: decision route, business-as-usual ownership and essential delivery partners;
- `benefits`: value expected from use of the deliverable;
- `measures`: evidence used to test whether benefits are being realised;
- `steps`: the sequenced delivery route;
- `risks`, `issues`, `assumptions`: optional whole-route planning concerns where they genuinely affect the whole deliverable.

The following older fields are no longer part of the canonical deliverable model and should not be authored for new or revised deliverables:

- `components`;
- `definitionOfDone`;
- deliverable-level `dependencies`;
- deliverable-level `decisions`;
- deliverable-level `resources`;
- `ownership.benefitOwner`;
- `ownership.contributors`;
- `ownership.decisionForum`.

Existing legacy values may remain readable in old source data, but the deliverable detail view should not present them as independent sections.

## Case for change

Field: `caseForChange`

Subfields:

- `problem`
- `opportunity`
- `whyNow`
- `intendedChange`

Backwards-compatible aliases:

- `problemSolved` maps to `caseForChange.problem`;
- `whatChanges` maps to `caseForChange.intendedChange`.

## Ownership and hero information

Field: `ownership`

Canonical subfields:

- `accountableOwner`
- `deliveryLead`

These appear in the deliverable hero and should not be repeated in the governance panel.

## Governance

Field: `governance`

Recommended subfields:

- `decisionForum`
- `decisionScope`
- `businessAsUsualOwner`
- `businessAsUsualOwnershipNote`
- `deliveryPartners`

Example:

```json
{
  "governance": {
    "decisionForum": "Vice Deans Education or delegates",
    "decisionScope": "Material choices about scope, investment, faculty participation, enduring ownership and escalation.",
    "businessAsUsualOwner": "TBC",
    "businessAsUsualOwnershipNote": "The enduring owner will be confirmed through the business-as-usual transfer step.",
    "deliveryPartners": [
      {
        "group": "Evidence and data",
        "partners": ["Careers and Employability Service", "Planning and analytics colleagues"],
        "contribution": "Provide, interpret and maintain the evidence and responsible-use guidance."
      }
    ]
  }
}
```

The governance section should answer:

- where material decisions and escalations go;
- who will own the enduring service, process, evidence resource or capability after mobilisation;
- which small set of partner groups is essential and what each contributes;
- who owns each benefit, derived from the benefits themselves.

Do not put accountable owner, delivery lead, planning maturity, step decisions, resource asks or a comprehensive stakeholder register in governance.

See `docs/governance-model.md` for the full authoring model.

## Benefits and measures

Benefits describe value realised through use. They are not tasks, products or documents.

Recommended benefit fields:

- `id`
- `title`
- `statement`
- `beneficiary`
- `benefitType`
- `owner`
- `realisationPeriod`
- `successLooksLike`
- `enabledBy`

Put the owner on each benefit. Different benefits may have different owners.

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

Use `governance.decisionForum` for the escalation route. Do not create a separate whole-deliverable decision list.

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

The app derives the deliverable-level resource and investment profile from step asks. Project-level profiles are then derived from the step asks across all deliverables in the project. Do not author separate deliverable-level or project-level resource plans.

To avoid double-counting, record a cash investment only on the step where the funding is first required. A later step may describe continued use of that funded capacity in an existing-capacity ask, but should not repeat the amount as new investment.

## Risks, issues and assumptions

Default to the step level.

Keep a risk, issue or assumption at deliverable level only when it materially affects the whole route or benefit realisation and cannot sensibly be attached to one step.

Do not duplicate the same item at both levels.

## Final authoring check

Before moving a deliverable to `draft`, check that:

- the case for change is clear;
- accountable ownership and delivery leadership are credible;
- each benefit has a clear owner;
- benefits describe value rather than products;
- measures test benefit realisation;
- the decision and escalation route is explicit;
- business-as-usual ownership is named or honestly shown as `TBC` with a route to resolution;
- key delivery partners are grouped by contribution rather than listed as a stakeholder register;
- every product is defined on a timeline step;
- completion evidence sits with the relevant output;
- dependencies and decisions sit on the relevant step;
- resources and material risks are captured at the most local useful level;
- the timeline is coherent enough to explain the route without a second planning structure.
