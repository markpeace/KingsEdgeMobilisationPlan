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
      "due": "jan-jun-2027:bc",
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

The current timeline period schema uses visible six-month buckets from `jul-dec-2026` to `jul-dec-2030`. Each bucket has hidden thirds for sequencing. Use `a`, `b`, `c`, `ab`, `bc` or `abc` after a colon when the step only uses part of a bucket.

Examples:

```json
{ "period": "jul-dec-2026:ab" }
{ "period": "jan-jun-2027:abc" }
```

For a step that spans more than one bucket, use explicit start and end points:

```json
{
  "period": {
    "start": "jan-jun-2027:b",
    "end": "jul-dec-2027:ab"
  }
}
```

Full step example:

```json
{
  "id": "2.2.1-step-2",
  "title": "Design Canvas tools and prompts",
  "period": "jan-jun-2027:bc",
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
        "period": "jan-jun-2027:bc",
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
      "neededBy": "jan-jun-2027:bc",
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
