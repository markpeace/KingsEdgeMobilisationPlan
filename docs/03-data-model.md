# Data Model

## Principle

The site now works from a single project hierarchy in the application layer.

All projects use the same shape:

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

The distinction between core King's Edge projects and projects delivered out of programme is now a metadata flag, not a different data structure.

## Current file structure

```text
src/data/
  kings-edge-plan.json
  enabling-projects.json
  step-dependencies.json
  status.json
```

## Project sources

`kings-edge-plan.json` still holds programme metadata, timeline periods and the four core Edge projects.

`enabling-projects.json` holds the out of programme projects that carry Edge requirements.

The app normalises these together through `src/plan-utils.js` into one `projects` array.

## Delivery context

Each project has a `deliveryContext` value:

```json
{
  "deliveryContext": "edge"
}
```

or:

```json
{
  "deliveryContext": "out-of-programme"
}
```

The UI uses this flag to render Edge projects first, then the out of programme projects after the dotted divider.

## Project object

```json
{
  "id": "single-student-app",
  "title": "Single Student App / Digital Portal",
  "owner": "TBC",
  "deliveryContext": "out-of-programme",
  "summary": "Provides the digital environment through which the King's Edge offer becomes navigable, personal and usable for students.",
  "edgeRole": "Carries the digital implementation for King's Canvas, opportunity navigation, evidence capture, digital badges, microcredentials and the future enhanced student record.",
  "deliverables": []
}
```

`edgeRole` is optional and mainly useful for out of programme projects.

## Deliverable object

```json
{
  "id": "2.1.1",
  "title": "Programme Graduate Premium Deep Dives",
  "lead": "Daniel Robson",
  "summary": "Programme or department-level deep dives combining data and narrative work to articulate the distinctive value graduates take out into the world.",
  "problemSolved": "The value of a programme is often implicit, under-evidenced or not described in language that connects with students, applicants, employers or the discipline itself.",
  "whatChanges": "Programmes develop evidenced and meaningful accounts of the value graduates take into the world.",
  "successMeasures": {
    "outputs": [],
    "kpis": []
  },
  "components": [],
  "steps": [],
  "feedsInto": [],
  "relatedDeliverables": [],
  "tags": []
}
```

`successMeasures` is optional. It is where deliverable-level outputs and KPIs should sit.

This same deliverable shape is now used for Edge projects and out of programme projects.

## Success measure object

Deliverable-level outputs can be simple strings or objects:

```json
{
  "title": "Published Canvas service blueprint",
  "type": "brief",
  "description": "Sets out the student journey, data requirements and touchpoints for Canvas.",
  "owner": "TBC",
  "due": "jan-summer-2027",
  "status": "not-started"
}
```

KPIs can use this shape:

```json
{
  "label": "Student engagement with purpose conversation",
  "type": "reach",
  "baseline": "TBC",
  "target": "TBC",
  "measure": "Proportion of participating students completing a Canvas reflection cycle",
  "dataSource": "TBC",
  "owner": "TBC",
  "reviewFrequency": "Termly",
  "period": "pilot"
}
```

## Step object

```json
{
  "id": "example-deliverable-step-2",
  "title": "Design and test the delivery model",
  "period": "jan-summer-2027",
  "summary": "Define the model, test it with users and refine the route to implementation.",
  "dependsOn": ["example-deliverable-step-1", "other-deliverable-step-1"],
  "outputs": [],
  "resources": {},
  "decisions": [],
  "risks": []
}
```

Step-level `outputs`, `resources`, `decisions` and `risks` are optional. Empty sections are hidden in the UI.

## Resource object

Resources sit at step level.

```json
{
  "people": [
    {
      "role": "Project manager",
      "type": "existing / new / seconded / TBC",
      "fte": 0.4,
      "notes": "Needed to coordinate mobilisation."
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
  "nonCashNeeds": [],
  "fundingStatus": "TBC",
  "resourceSummary": "Requires project, digital and student research capacity."
}
```

## Dependencies

There are two dependency levels:

1. deliverable-level references inside each deliverable, mainly for narrative relationship
2. step-level dependencies in `step-dependencies.json`, used by the timeline lens

Step-level dependencies should be preferred when the relationship is operational.
