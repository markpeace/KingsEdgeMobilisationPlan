# Content Maintenance

## Principle

Ordinary plan updates should be made in the JSON data file, not in the React components.

Current data file:

```text
src/data/kings-edge-plan.json
```

## Adding or editing a deliverable

Each deliverable sits inside its parent project and should include:

- `id`
- `title`
- `lead`
- `summary`
- `problemSolved`
- `whatChanges`
- `components`
- `steps`
- `dependencies`
- `feedsInto`
- `relatedDeliverables`
- `tags`

## Adding dependencies

Use dependencies to show what a deliverable needs or produces.

Recommended dependency types:

- `input`
- `handoff`
- `alignment`
- `enabler`
- `evidence-feed`

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

Before committing changes to the data file, check that the JSON remains valid and that references resolve.

Run:

```bash
npm run validate:data
```

The validation script checks:

- duplicate ids
- required project fields
- required deliverable fields
- required step fields
- timeline period ids
- dependency references
- feeds into references
- related deliverable references
- step-level dependency references

The production build runs validation automatically:

```bash
npm run build
```

If validation fails, the build will stop before deployment.
