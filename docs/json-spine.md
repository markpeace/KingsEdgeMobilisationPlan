# JSON spine and rendering contract

This repository uses JSON as the spine of the King's Edge Mobilisation Plan. The site should render plan content from JSON through a small normalisation layer, not from hard-coded React copy or display workarounds.

## Canonical data surfaces

- `src/data/kings-edge-plan.json` holds the programme, project order, project IDs, project summaries and baseline deliverables.
- `src/data/enabling-projects.json` holds out-of-programme or enabling projects.
- `src/data/status.json` holds delivery-control status metadata only. It is not the planning-stage workflow.
- `src/data/step-dependencies.json` holds cross-step dependency references when they need to be maintained separately.
- `src/data/deliverables/manifest.json` is the deliverable registry. Each registered deliverable points to the JSON parts that make up that deliverable.
- `src/data/deliverables/<deliverable-id>/` contains the detailed JSON files for one deliverable.

## Deliverable file pattern

Each detailed deliverable should have its own folder under `src/data/deliverables/` named with the deliverable ID. A deliverable may be split into focused JSON parts so a project manager can edit a bounded topic without touching application code.

Recommended part names:

1. `core.json` — title, lead, planning status, summary, case for change and ownership.
2. `overview.json` — narrative refinements or overview-level planning fields.
3. `outputs-measures.json` — outputs, measures and evidence fields.
4. `steps.json` — delivery steps, step-level resources, decisions, risks, issues and assumptions.
5. `benefits.json` — benefit statements and benefit realisation assumptions.
6. `measures-benefit-map.json` — links between measures and benefits.
7. `governance.json` — governance, decision forums and delivery controls.

The manifest defines the merge order. Later files may intentionally replace or extend earlier fields, but this should be used as transparent composition, not as a hidden override.

## Rendering path

The rendering path is:

1. JSON files under `src/data/` define the content and structure.
2. `src/data/deliverables/index.js` loads deliverable JSON parts listed in `manifest.json` and merges them into registered deliverables.
3. `src/plan-utils.js` imports the base plan data and registered deliverables, normalises legacy-compatible fields and builds lookup structures.
4. `src/site.jsx` renders projects, deliverables, measures and timeline views from the normalised data exported by `src/plan-utils.js`.

React components should not contain plan copy that belongs in JSON. CSS should style states but should not encode programme meaning that belongs in JSON.

## No workaround rule

Do not add display remapping, title substitution, hidden project reordering or one-off React conditionals to conceal data problems. If an ID, order, title, status, owner, measure or dependency is wrong, fix the JSON source of truth and then let the site render it normally.

Acceptable compatibility logic is limited to normalising old field names into the current schema while the content migrates. New content should use the documented schema directly.

## Planning stage rule

`planningStatus` is the only planning-stage workflow. Allowed values are:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Do not use `tags`, `planningMaturity`, `visibility` or `status.json` as substitutes for planning stage.

## How an LLM project manager should work safely

1. Hydrate from `docs/hydration-guide.md`, `docs/working-modes.md`, `docs/deliverable-schema.md` and this file.
2. Decide whether the task is project manager mode, developer mode or schema-plus-rendering work.
3. In project manager mode, edit JSON only unless explicitly asked otherwise.
4. For detailed deliverables, edit the relevant `src/data/deliverables/<id>/*.json` file and update `manifest.json` only when adding, removing or reordering parts.
5. Preserve IDs unless the user has agreed an ID migration.
6. Run validation and build checks after changes.
7. Summarise whether changes affected data, rendering or both.
