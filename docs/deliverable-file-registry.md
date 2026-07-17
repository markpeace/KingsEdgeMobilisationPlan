# Deliverable file registry

## Purpose

The main programme spine should stay small enough to edit safely. It should hold programme and project structure, project order and lightweight deliverable placeholders.

Richer deliverable planning lives in explicit per-deliverable JSON folders and is merged into the spine at load time.

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
    "./2.1.1/core.json",
    "./2.1.1/overview.json",
    "./2.1.1/outputs-measures.json",
    "./2.1.1/steps.json"
  ]
}
```

Parts are merged in manifest order. Later files may intentionally replace or extend earlier fields, but that composition must stay visible in the manifest rather than hidden in ad hoc overrides. This allows a deliverable to be split into smaller editable pieces, for example:

```text
src/data/deliverables/2.1.1/core.json
src/data/deliverables/2.1.1/outputs-measures.json
src/data/deliverables/2.1.1/steps.json
src/data/deliverables/2.1.1/governance.json
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
2. Create `src/data/deliverables/<deliverable-id>/` and one or more JSON part files for the full deliverable.
3. Add the deliverable to `src/data/deliverables/manifest.json`.
4. Run `npm run validate:data` before committing.

For small deliverables still in Proposition development, it is acceptable to leave the content directly in the spine until the object becomes too large to edit comfortably.
