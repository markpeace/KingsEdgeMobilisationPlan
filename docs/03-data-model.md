# Data Model

## Principle

The plan should live in JSON and the interface should render from that JSON.

The JSON is the single source of truth for:

- projects
- deliverables
- owners
- summaries
- components
- delivery steps
- timing
- dependencies
- related deliverables
- cross-programme dependencies

## Proposed file structure

Suggested data files:

```text
data/
  kings-edge-plan.json
  timeline-periods.json
  dependency-types.json
```

For the first version, a single `data/kings-edge-plan.json` file is enough.

## Top-level structure

```json
{
  "programme": {
    "id": "2",
    "title": "King's Edge",
    "purpose": "Makes the King's graduate premium real, visible, navigable and evidenced for every student."
  },
  "timelinePeriods": [],
  "projects": [],
  "crossProgrammeDependencies": []
}
```

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
  "dependencies": [],
  "feedsInto": [],
  "relatedDeliverables": [],
  "tags": []
}
```

## Component object

```json
{
  "title": "Programme-level data deep dives",
  "summary": "Use outcomes, destinations, further study, highly skilled employment, progression patterns, demographics and opportunity participation to understand graduate value at programme or department level."
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

## Timeline period object

```json
{
  "id": "now-xmas-2026",
  "label": "Now to Christmas 2026",
  "shortLabel": "Now-Xmas 26",
  "order": 1
}
```

## Dependency object

```json
{
  "targetId": "2.1.2",
  "type": "input",
  "label": "Requires the experiential learning typology, North Star and principles from the Community of Practice."
}
```

## Dependency types

Suggested dependency types:

| Type | Meaning |
|---|---|
| `input` | Needs an output from another deliverable before it can progress properly |
| `handoff` | Produces requirements for another project, system or programme |
| `alignment` | Needs to remain consistent with another strand, but can progress in parallel |
| `enabler` | Provides infrastructure others will use |
| `evidence-feed` | Provides data, insight or stories into another deliverable |

## Cross-programme dependency object

```json
{
  "id": "single-student-app",
  "title": "Single Student App / Digital Portal",
  "summary": "Provides the digital environment through which the King's Edge offer becomes navigable, personal and usable for students.",
  "edgeNeedsServiced": [],
  "relatedDeliverables": ["2.2.1", "2.3.1", "2.4.3"]
}
```

## Gantt rendering logic

The Gantt should render rows from deliverables and bars from delivery steps.

Each step has one `period`. Later versions may allow `startPeriod` and `endPeriod` if a step spans multiple periods.

For version one:

- one deliverable row
- four period columns
- each step appears in its period column
- dependencies show as icons, hover panels or optional connecting lines

## URL slugs

The deliverable `id` should drive routes.

Examples:

- `/deliverables/2.1.1`
- `/deliverables/2.2.1`
- `/deliverables/2.4.3`
