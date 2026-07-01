# Data Model

## Principle

The plan lives in JSON and the interface renders from that JSON.

The data model now separates four concerns:

- the core King's Edge plan
- related wider portfolio projects
- step-to-step dependencies
- status, confidence and decision flags

This keeps content, dependency logic and mobilisation status easier to maintain.

## Current file structure

```text
src/data/
  kings-edge-plan.json
  enabling-projects.json
  step-dependencies.json
  status.json
```

## Core plan file

`kings-edge-plan.json` holds:

- programme metadata
- timeline periods
- the four King's Edge projects
- the sixteen Edge deliverables
- components
- delivery steps
- tags and related deliverables

## Related projects file

`enabling-projects.json` holds the wider portfolio projects that carry Edge requirements.

Current related projects:

- Education Cultures and Innovation
- Curriculum Framework and Review
- Single Student App / Digital Portal

These are not dependencies in themselves. They are projects with their own delivery steps.

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

## Project object

```json
{
  "id": "2.1",
  "title": "Curriculum-Embedded Graduate Premium",
  "owner": "Aranee Manoharan",
  "summary": "Makes the graduate premium visible and capable of growth within the academic curriculum.",
  "deliverables": []
}
```

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

## Related project object

```json
{
  "id": "single-student-app",
  "title": "Single Student App / Digital Portal",
  "owner": "TBC",
  "summary": "Provides the digital environment through which the King's Edge offer becomes navigable, personal and usable for students.",
  "edgeRole": "Carries the digital implementation for King's Canvas, opportunity navigation, evidence capture, digital badges, microcredentials and the future enhanced student record.",
  "components": [],
  "steps": [],
  "servesDeliverables": ["2.2.1", "2.3.1", "2.4.3"]
}
```

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

- rows from Edge deliverables and related projects
- columns from timeline periods
- blocks from delivery steps
- dependency highlights from `step-dependencies.json`
- status and confidence from `status.json`

## URL slugs

The deliverable `id` drives routes.

Examples:

- `#/deliverables/2.1.1`
- `#/deliverables/2.2.1`
- `#/deliverables/2.4.3`
