# Content maintenance

## Principle

Ordinary plan updates should be made in JSON data, not in React components or CSS overrides.

Current core data files:

```text
src/data/kings-edge-plan.json
src/data/enabling-projects.json
src/data/step-dependencies.json
src/data/status.json
src/data/deliverables/manifest.json
src/data/deliverable-overrides/
```

## Canonical hierarchy

```text
project
  deliverables
    caseForChange
    ownership
      accountableOwner
      deliveryLead
    governance
      decisionForum
      decisionScope
      businessAsUsualOwner
      deliveryPartners
    benefits
      owner
      successLooksLike
      enabledBy
    measures
      supportsBenefits
    risks / issues / assumptions where genuinely cross-cutting
    steps
      outputs
      resources
        existingCapacity
        newInvestment
        enablingConditions
      decisions
      risks
      issues
      assumptions
      dependsOn
```

The Delivery timeline is the source of truth for operational delivery.

Do not add independent deliverable-level sections for:

- components;
- definition of done;
- dependencies;
- decisions;
- resources.

Products, completion criteria, dependencies, decisions and resource asks belong on the relevant delivery step.

## Editing projects

Core King's Edge projects sit in:

```text
src/data/kings-edge-plan.json
```

Related out-of-programme projects sit in:

```text
src/data/enabling-projects.json
```

Each project should include:

- `id`
- `title`
- `owner`
- `summary`
- `deliveryContext`
- `deliverables`

Use `deliveryContext: "edge"` or `deliveryContext: "out-of-programme"`.

## Editing deliverables

Each revised deliverable should normally include:

- `id`
- `title`
- `lead`
- `summary`
- `detailSummary` where useful
- `planningStatus`
- `caseForChange`
- `ownership`
- `governance`
- `benefits`
- `measures`
- `steps`

Optional whole-route fields:

- `risks`
- `issues`
- `assumptions`
- `feedsInto`
- `relatedDeliverables`
- `tags`

Use whole-route fields sparingly. Operational content should sit on steps.

### Do not author these fields for new or revised deliverables

- `components`
- `definitionOfDone`
- deliverable-level `dependencies`
- deliverable-level `decisions`
- deliverable-level `resources`
- `ownership.benefitOwner`
- `ownership.contributors`
- `ownership.decisionForum`

Legacy source data may still contain them, but they are not part of the canonical model or deliverable detail view.

## Ownership and governance

The hero already shows:

- `ownership.accountableOwner`
- `ownership.deliveryLead`

Do not repeat them in governance.

The governance object should normally include:

- `decisionForum`
- `decisionScope`
- `businessAsUsualOwner`
- `businessAsUsualOwnershipNote` where useful
- `deliveryPartners`

Example:

```json
{
  "ownership": {
    "accountableOwner": "Aranee Manoharan",
    "deliveryLead": "Daniel Robson"
  },
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

Keep `deliveryPartners` small and grouped by contribution. It is not a comprehensive stakeholder register.

See `docs/governance-model.md` for full guidance.

## Benefits and measures

Benefits describe the value created when timeline outputs are used.

Each benefit should normally include:

- `id`
- `title`
- `statement`
- `beneficiary`
- `benefitType` where useful
- `owner`
- `realisationPeriod`
- `successLooksLike`
- `enabledBy`

Example:

```json
{
  "id": "2.1.1-B1",
  "title": "Programmes can claim their graduate futures value with confidence",
  "statement": "Programme teams have credible evidence and language for articulating distinctive programme value.",
  "beneficiary": "Programme teams, students, applicants and faculties",
  "owner": "Heads of Department",
  "realisationPeriod": "2026/27 onwards",
  "successLooksLike": "Each participating programme has a programme-confirmed, evidence-linked and appropriately caveated graduate futures story.",
  "enabledBy": [
    {
      "stepId": "2.1.1-step-1",
      "outputTitle": "First working graduate futures evidence pack"
    }
  ]
}
```

Measures are authored once at deliverable level and linked to benefits through `supportsBenefits`.

```json
{
  "id": "2.1.1-M1",
  "title": "Programme graduate futures profiles completed and confirmed",
  "supportsBenefits": ["2.1.1-B1"],
  "questionAnswered": "Are programme groups producing credible story artefacts they recognise and can use?",
  "measure": "Count and percentage with a completed and programme-confirmed profile or equivalent artefact.",
  "baseline": "0 through this model.",
  "target": "Each agreed programme group completes and confirms a proportionate artefact before wider use.",
  "owner": "Heads of Department",
  "cadence": "Termly"
}
```

Do not separately author an `evidenceOfSuccess` list when linked measures already express the evidence.

Do not put products or outputs inside benefits. Reference the relevant timeline output through `enabledBy`.

## Adding delivery steps

Each step should include:

- `id`
- `title`
- `period`
- `summary`
- `dependsOn`

Optional step detail:

- `outputs`
- `resources`
- `decisions`
- `risks`
- `issues`
- `assumptions`

### Products and completion evidence

Define each product or output on the step that produces it.

Use `acceptanceCriteria`, an output-specific completion statement or another local evidence field to show when that output is ready. Do not maintain a separate deliverable-level definition of done.

### Decisions

Put decisions on the step they gate or change.

Use `governance.decisionForum` to identify the escalation or approval route.

### Dependencies

Use `dependsOn` for sequencing and handoffs, including cross-deliverable dependencies.

```json
"dependsOn": ["2.1.1-step-2", "2.4.1-step-1"]
```

Do not duplicate these relationships in a deliverable-level dependency list.

## Timeline periods

Visible six-month buckets run from `jul-dec-2026` to `jul-dec-2030`. Each bucket has hidden thirds: `a`, `b`, `c`, `ab`, `bc` or `abc`.

Within one bucket:

```json
"period": "jul-dec-2026:ab"
```

Across a bucket boundary:

```json
"period": {
  "start": "jul-dec-2026:c",
  "end": "jan-jun-2027:ab"
}
```

## Step-level resources

All resource demand belongs on the step that needs it.

Canonical groups:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`

Each ask should identify why it is needed and, where known, owner, timing, decision deadline, cost, confidence and risk if missing.

The app derives the Resource and investment profile from these step asks.

## Risks, issues and assumptions

Put these on the step they affect.

Keep an item at deliverable level only where it affects the whole route or benefit realisation and cannot sensibly be attached to one step.

Do not duplicate the same item at both levels.

## Final authoring check

Before moving a deliverable to `draft`, check that:

- the case for change is clear;
- accountable owner and delivery lead are credible;
- every benefit has an owner;
- benefits describe value rather than products;
- measures test benefit realisation;
- the decision and escalation route is explicit;
- business-as-usual ownership is named or honestly shown as `TBC` with a route to resolution;
- key partners are grouped by contribution rather than listed indiscriminately;
- every product is defined on a timeline step;
- completion evidence sits with the relevant output;
- dependencies and decisions sit on the relevant step;
- resources and material risks are captured at the most local useful level;
- the timeline is coherent enough to explain the route without a second planning structure.
