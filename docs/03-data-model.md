# Data Model

## Principle

The site now works from a single project hierarchy in the application layer.

All projects use the same shape:

```text
project
  deliverables
    components
    steps
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
  "lead": "Dan Robson",
  "summary": "Programme or department-level deep dives combining data and narrative work to articulate the distinctive value graduates take out into the world.",
  "problemSolved": "The value of a programme is often implicit, under-evidenced or not described in language that connects with students, applicants, employers or the discipline itself.",
  "whatChanges": "Programmes develop evidenced and meaningful accounts of the value graduates take into the world.",
  "components": [],
  "steps": [],
  "feedsInto": [],
  "relatedDeliverables": [],
  "tags": []
}
```

This same deliverable shape is now used for Edge projects and out of programme projects.

## Delivery step object

```json
{
  "id": "2.1.1-step-1",
  "title": "Define the deep dive model",
  "period": "now-xmas-2026",
  "summary": "Agree what a programme-level deep dive should include and how it should connect data with narrative articulation.",
  "dependsOn": []
}
```

The active dependency model uses `step-dependencies.json` as the main dependency source, while `dependsOn` remains available inside steps for simple local references.

## Step dependency file

`step-dependencies.json` holds the dependency layer.

Dependencies are step-to-step relationships, for example:

```json
{
  "2.2.2-step-2": ["2.1.2-step-4"],
  "2.3.1-step-3": ["2.2.1-step-2", "single-app-step-2"]
}
```

This allows the Gantt to show what a selected step needs and what it enables.

## Status file

`status.json` holds mobilisation status separately from the plan text.

Each item can have:

```json
{
  "status": "scoping",
  "confidence": "needs-validation",
  "decisionNeeded": true,
  "note": "Short explanation of what needs attention."
}
```

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

## Timeline period object

```json
{
  "id": "now-xmas-2026",
  "label": "Now to Christmas 2026",
  "shortLabel": "Now-Xmas 26",
  "order": 1
}
```

## Gantt rendering logic

The Gantt renders:

- rows from deliverables across all projects
- columns from timeline periods
- blocks from delivery steps
- dependency highlights from `step-dependencies.json`
- status and confidence from `status.json`

Out of programme deliverables can be shown or hidden in the timeline using the existing toggle.

## URL slugs

Project and deliverable ids drive routes.

Examples:

- `#/projects/2.1`
- `#/projects/single-student-app`
- `#/deliverables/2.1.1`
- `#/deliverables/single-student-app.2`
