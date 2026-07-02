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
    components
    steps
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
- `components`
- `steps`
- `feedsInto`
- `relatedDeliverables`
- `tags`

This same deliverable structure applies to Edge and out of programme projects.

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

## Adding delivery steps

Each step should have:

- `id`
- `title`
- `period`
- `summary`
- `dependsOn`

The `period` must match one of the timeline period ids.

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
