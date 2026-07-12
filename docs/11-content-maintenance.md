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
    benefits
    measures
    resources
    risks / issues / assumptions where genuinely cross-cutting
    steps
      outputs
      resources
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
- decisions.

Products, completion criteria, dependencies and decisions belong on the relevant delivery step.

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

Use:

```json
"deliveryContext": "edge"
```

or:

```json
"deliveryContext": "out-of-programme"
```

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
- `benefits`
- `measures`
- `steps`

Optional whole-route fields:

- `resources`
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

Legacy source data may still contain them, but they are not part of the canonical model or deliverable detail view.

## Benefits and measures

Benefits describe the value created when timeline outputs are used.

Each benefit should normally include:

- `id`
- `title`
- `statement`
- `beneficiary`
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

Do not separately author an `evidenceOfSuccess` list when the linked measures already express the evidence.

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

Example:

```json
{
  "id": "2.2.1-step-2",
  "title": "Design Canvas tools and prompts",
  "period": "jan-jun-2027:bc",
  "summary": "Specify the student journey, tools, prompts and implementation requirements.",
  "dependsOn": ["2.2.1-step-1", "2.1.3-step-1"],
  "outputs": [
    {
      "id": "2.2.1-step-2-output-blueprint",
      "title": "Canvas service blueprint",
      "summary": "Sets out the proposed student journey and implementation requirements.",
      "acceptanceCriteria": [
        "Student journey agreed with relevant owners.",
        "Data and system requirements identified.",
        "Implementation route is sufficiently clear for the next step."
      ]
    }
  ],
  "resources": {
    "existingCapacity": [
      {
        "role": "Project manager",
        "fte": 0.4,
        "contribution": "Coordinate design and owner input."
      }
    ]
  },
  "decisions": [
    {
      "title": "Confirm build route",
      "owner": "TBC",
      "neededBy": "jan-jun-2027:bc"
    }
  ],
  "risks": [
    {
      "title": "Tool design runs ahead of digital capacity",
      "mitigation": "Tie requirements into roadmap planning early."
    }
  ]
}
```

### Products and completion evidence

Define each product or output on the step that produces it.

Use `acceptanceCriteria`, an output-specific completion statement or another local evidence field to show when that output is ready. Do not maintain a separate deliverable-level definition of done.

### Decisions

Put decisions on the step they gate or change.

Use `ownership.decisionForum` to identify the escalation or approval route.

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

The start point uses the first third represented by its segment. The end point uses the final third represented by its segment.

## Resources

Use step-level resources wherever possible.

Canonical groups:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`
- `fundingSummary`
- `investmentAsk`

Use deliverable-level resources only for a consolidated whole-route position or investment ask.

## Risks, issues and assumptions

Put these on the step they affect.

Keep an item at deliverable level only where it affects the whole route or benefit realisation and cannot sensibly be attached to one step.

Do not duplicate the same item at both levels.

## Step-level dependency overrides

Step-level dependency overrides sit in:

```text
src/data/step-dependencies.json
```

Prefer authoring `dependsOn` directly on the step where practical. Use the override file only when central maintenance is genuinely useful.

## Final authoring check

Before moving a deliverable to `draft`, check that:

- the case for change is clear;
- ownership and benefit ownership are credible;
- benefits describe value rather than products;
- measures test benefit realisation;
- every product is defined on a timeline step;
- completion evidence sits with the relevant output;
- dependencies and decisions sit on the relevant step;
- resources and material risks are captured at the most local useful level;
- the timeline is coherent enough to explain the route without a second planning structure.
