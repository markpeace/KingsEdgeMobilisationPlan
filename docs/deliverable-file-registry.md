# Deliverable file registry

## Purpose

The main programme spine should stay small enough to edit safely. It should hold programme and project structure, project order and lightweight deliverable placeholders.

Richer deliverable planning can now live in separate JSON files and be merged into the spine at load time.

## Registry location

Registered deliverables are listed in:

```text
src/data/deliverables/manifest.json
```

Each entry identifies the deliverable and the ordered JSON parts that make up the final object.

Example:

```json
{
  "id": "2.1.1",
  "projectId": "2.1",
  "parts": [
    "../deliverable-overrides/2.1.1.json",
    "../deliverable-overrides/2.1.1-overview-patch.json",
    "../deliverable-overrides/2.1.1-outputs-measures-patch.json",
    "../deliverable-overrides/2.1.1-steps-patch.json"
  ]
}
```

Parts are merged in order. Later files override or extend earlier files. This allows a deliverable to be split into smaller editable pieces, for example:

```text
base.json
outputs-measures.json
steps.json
resources-raid.json
```

## How the app uses the registry

The app loads the registry through:

```text
src/data/deliverables/index.js
```

`src/plan-utils.js` then replaces any matching lightweight spine deliverable with the registered full deliverable object.

This means the spine can continue to contain a short placeholder for ordering and project membership, while the full detail is maintained separately.

## Validation

The validation script also reads the same manifest before validating the plan:

```text
scripts/validate-plan.mjs
```

A registered deliverable is validated after its JSON parts are merged, so missing fields, bad periods and bad references are still caught.

## Editing rule

For substantial deliverable edits, prefer editing the registered deliverable part files rather than replacing `src/data/kings-edge-plan.json`.

For a new mature deliverable:

1. Keep or add a lightweight deliverable placeholder in the relevant project in `src/data/kings-edge-plan.json`.
2. Create one or more JSON part files for the full deliverable.
3. Add the deliverable to `src/data/deliverables/manifest.json`.
4. Run `npm run validate:data` before committing.

For small pre-draft deliverables, it is still acceptable to leave the content directly in the spine until the object becomes too large to edit comfortably.
