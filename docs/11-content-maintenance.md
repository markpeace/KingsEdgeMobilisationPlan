# Content Maintenance

## Principle

Ordinary plan updates should be made in the JSON data files, not in the React components.

Current data files:

```text
src/data/kings-edge-plan.json
src/data/enabling-projects.json
src/data/step-dependencies.json
src/data/status.json
```

## Single project hierarchy

All projects now use the same structure:

```text
project
  deliverables
    successMeasures
    components
    steps
      outputs
      resources
      decisions
      risks
```

The distinction between Edge projects and out of programme projects is held in `deliveryContext`:

- `edge`
- `out-of-programme`

## Editing Edge projects

Core Edge projects sit in:

```text
src/data/kings-edge-plan.json
```

Each project should include:

- `id`
- `title`
- `owner`
- `summary`
- `deliveryContext`
- `deliverables`

The `deliveryContext` for core Edge projects defaults to `edge` if omitted, but it is better to add it explicitly when doing larger content work.

## Editing out of programme projects

Out of programme projects sit in:

```text
src/data/enabling-projects.json
```

Each project should use the same project shape and include:

- `id`
- `title`
- `owner`
- `deliveryContext`
- `summary`
- `edgeRole`
- `deliverables`
- `servesDeliverables`

Use:

```json
"deliveryContext": "out-of-programme"
```

These projects are not dependencies in themselves. They are delivery projects that carry some Edge requirements.

## Editing deliverables

Each deliverable should include:

- `id`
- `title`
- `lead`
- `summary`
- `problemSolved`
- `whatChanges`
- `successMeasures`
- `components`
- `steps`
- `feedsInto`
- `relatedDeliverables`
- `tags`

`successMeasures` is optional, but should be used when the deliverable has clear outputs or KPIs.

Example:

```json
"successMeasures": {
  "outputs": [
    {
      "title": "Published Canvas service blueprint",
      "type": "brief",
      "description": "Sets out the student journey, data requirements and touchpoints.",
      "owner": "TBC",
      "due": "jan-summer-2027",
      "status": "not-started"
    }
  ],
  "kpis": [
    {
      "label": "Student engagement with purpose conversation",
      "type": "reach",
      "target": "TBC",
      "measure": "Proportion of participating students completing a Canvas reflection cycle",
      "period": "pilot"
    }
  ]
}
```

This same deliverable structure applies to Edge and out of programme projects.

## Adding delivery steps

Each step should have:

- `id`
- `title`
- `period`
- `summary`
- `dependsOn`

The step can also include optional detail:

- `outputs`
- `resources`
- `decisions`
- `risks`

Example:

```json
{
  "id": "2.2.1-step-2",
  "title": "Design Canvas tools and prompts",
  "period": "jan-summer-2027",
  "summary": "Specify AI functionality, reflection prompts, planning tools, skills links and student outputs.",
  "dependsOn": ["2.2.1-step-1", "2.1.3-step-1"],
  "outputs": [
    {
      "title": "Canvas service blueprint",
      "type": "brief",
      "description": "Sets out the proposed student journey and implementation requirements."
    }
  ],
  "resources": {
    "people": [
      {
        "role": "Project manager",
        "type": "existing / new / seconded / TBC",
        "fte": 0.4,
        "notes": "Needed to coordinate early mobilisation."
      }
    ],
    "cashCosts": [
      {
        "item": "Student co-design and testing",
        "category": "research",
        "amount": 15000,
        "currency": "GBP",
        "period": "jan-summer-2027",
        "recurrence": "one-off",
        "confidence": "estimate",
        "notes": "Workshops, incentives and synthesis."
      }
    ],
    "nonCashNeeds": [
      {
        "item": "Digital product roadmap input",
        "owner": "Single Student App",
        "notes": "Needed to align requirements with the app build."
      }
    ],
    "fundingStatus": "TBC",
    "resourceSummary": "Requires project, digital and student research capacity."
  },
  "decisions": [
    {
      "title": "Confirm build route",
      "owner": "TBC",
      "neededBy": "jan-summer-2027",
      "notes": "Needed before detailed tool design is finalised."
    }
  ],
  "risks": [
    {
      "title": "Tool design runs ahead of digital capacity",
      "mitigation": "Tie requirements into Single Student App planning early."
    }
  ]
}
```

Empty optional sections are hidden in the interface.

## Editing step-level dependencies

Step-level dependencies sit in:

```text
src/data/step-dependencies.json
```

Use this file to show which specific steps need other specific steps to land first.

Example:

```json
{
  "2.3.1-step-3": ["2.2.1-step-2", "single-app-step-2"]
}
```

## Editing status and confidence

Status and confidence sit in:

```text
src/data/status.json
```

Each item can include:

- `status`
- `confidence`
- `decisionNeeded`
- `note`

Supported statuses:

- `not-started`
- `scoping`
- `active`
- `blocked`
- `complete`

Supported confidence levels:

- `settled`
- `needs-validation`
- `placeholder`

## Current timeline period ids

- `now-xmas-2026`
- `jan-summer-2027`
- `ay-2027-28-to-2028-29`
- `ay-2029-30`

## JSON validation

Before committing changes, check that the JSON remains valid and that references resolve.

Run:

```bash
npm run validate:data
```

The validation script checks:

- duplicate ids
- required project fields
- required deliverable fields
- required step fields
- optional success measure shape
- optional resource shape
- delivery context values
- timeline period ids
- feeds into references
- related deliverable references
- step-level dependency references
- status entries

The production build runs validation automatically:

```bash
npm run build
```

If validation fails, the build will stop before deployment.
