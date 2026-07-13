# New chat hydration guide

Use this guide when starting a new conversation about the King's Edge Mobilisation Plan repository.

The goal is to give a new agent enough context to continue from the current state without relying on private chat memory.

## Start here

Before editing anything, read these files in this order:

1. `docs/hydration-guide.md`
2. `docs/working-modes.md`
3. `docs/deliverable-schema.md`
4. `docs/json-spine.md`
5. `docs/repository-memory.md`
6. `docs/schema-source-of-truth-audit.md`
7. `docs/next-repository-update-brief.md`
8. `src/plan-utils.js`
9. Relevant JSON files under `src/data/`

If the task is about app rendering or UI, also inspect:

- `src/site.jsx`
- `src/styles.css`
- relevant files in `public/*.css`
- `index.html`

## Current critical rules

Use one planning-stage workflow only: `planningStatus`.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

All current deliverables default to `pre-draft` unless the JSON explicitly says otherwise.

Do not treat `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` as the planning-stage workflow.

The source-of-truth migration has been applied. `src/data/kings-edge-plan.json` now carries the canonical project order and IDs directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

`src/plan-utils.js` should not contain hidden project renumbering, title substitution or display-order remapping. If project order, title or numbering is wrong, fix the JSON source of truth.

## Confirm the working mode

Project manager mode means the plan content, structure or schema is being changed. The primary editing surface is JSON.

Developer mode means the app rendering, layout, styling or interaction design is being changed. The primary editing surface is React, CSS, HTML and configuration.

Some work crosses both modes. Schema changes that also need rendering changes should be handled explicitly as schema-plus-rendering work.

## Project manager mode hydration prompt

Use this prompt to start a new project manager mode chat:

You are working in project manager mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/working-modes.md`, `docs/deliverable-schema.md`, `docs/json-spine.md`, `docs/repository-memory.md`, `docs/schema-source-of-truth-audit.md`, `docs/next-repository-update-brief.md`, `src/plan-utils.js` and the relevant JSON files under `src/data/`.

In this mode, treat JSON as the primary editing surface. Work mainly in `src/data/kings-edge-plan.json`, `src/data/enabling-projects.json`, `src/data/step-dependencies.json` and `src/data/status.json`. Do not make React, CSS, layout or rendering changes unless I explicitly switch to developer mode or ask for schema-plus-rendering work.

The only canonical planning-stage workflow is `planningStatus`: `pre-draft`, `draft`, `validated-draft`, `decision-ready`, `mobilising`, `in-delivery`. Do not use generic `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` for that workflow.

Treat all current deliverables as `pre-draft` unless the JSON says otherwise. Move a deliverable to `draft` only after it has been scrutinised against the schema. Keep benefits, outputs and measures distinct. Distinguish existing capacity, new investment and enabling conditions when discussing resources. Do not place genuinely restricted material in broad client-side JSON.

The canonical project order and IDs are already in `src/data/kings-edge-plan.json`. Do not add display-remapping workarounds. If project order, title or numbering is wrong, fix the JSON source of truth.

Recommended rhythm: first sharpen the four project titles, summaries and transformation claims; then work through deliverables in order to move them from `pre-draft` to `draft`.

Before making major JSON changes, explain the proposed shape and any risks to plan integrity. After changes, summarise which files changed and whether there are rendering consequences.

## Developer mode hydration prompt

Use this prompt to start a new developer mode chat:

You are working in developer mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/working-modes.md`, `docs/deliverable-schema.md`, `docs/json-spine.md`, `docs/repository-memory.md`, `docs/schema-source-of-truth-audit.md`, `docs/next-repository-update-brief.md`, `src/plan-utils.js`, `src/site.jsx`, relevant CSS files in `public/` and `src/styles.css`.

In this mode, treat the website rendering as the primary editing surface. Work mainly in React, CSS, HTML and configuration. You may inspect JSON to understand the data model, but do not change the plan data unless I explicitly ask for a schema or content update.

Preserve the separation between data and rendering. Do not hard-code plan content into React or CSS when it belongs in JSON. Do not add display-remapping workarounds to hide source-data problems. If a UI improvement requires a schema or ID change, pause and explain the implication for the plan before editing JSON.

Make planning status visible without turning it into red/amber/green performance status. Treat “Reveal detailed plan” as progressive disclosure, not security. Ensure Measures and Timeline views do not present pre-draft assumptions as approved KPIs or live delivery plans.

After making changes, summarise what changed, which files were edited and whether the change affects data, rendering or both.

## Repo map

Core plan data:

- `src/data/kings-edge-plan.json`: core Edge programme, projects, deliverables and steps. This is the main source of truth for programme and project structure.
- `src/data/enabling-projects.json`: out-of-programme or enabling projects.
- `src/data/deliverables/manifest.json`: registry for detailed deliverable JSON parts.
- `src/data/deliverables/<deliverable-id>/`: JSON spine folders for detailed deliverables.
- `src/data/schema-example-content.json`: retired overlay. Do not use it to add hidden content.
- `src/data/step-dependencies.json`: currently empty. Step dependencies should usually live in the core plan data.
- `src/data/status.json`: hidden delivery-control metadata. Not the planning-stage workflow.

Normalisation and ordering:

- `src/plan-utils.js`: normalises schema fields, builds lookups and dependency indexes. It should not remap project IDs, titles or order.

Rendering:

- `src/site.jsx`: React app and page rendering.
- `src/styles.css`: base styling.
- `public/*.css`: focused style overrides.
- `index.html`: loads CSS files and app entry point.

Background documentation:

- `docs/working-modes.md`: explains project manager mode and developer mode.
- `docs/deliverable-schema.md`: describes the current deliverable schema.
- `docs/json-spine.md`: explains the JSON spine, registry and no-workaround rendering contract.
- `docs/repository-memory.md`: background decisions and working assumptions.
- `docs/schema-source-of-truth-audit.md`: records the completed source-of-truth cleanup and guardrails.
- `docs/next-repository-update-brief.md`: next project-manager-mode work brief.
- `docs/hydration-guide.md`: this file.

## Checks before editing

Ask these questions before changing files:

- Am I changing what the plan says? If yes, this is project manager mode.
- Am I changing how the plan appears or behaves? If yes, this is developer mode.
- Am I changing what the plan can say? If yes, this is schema-plus-rendering work.
- Am I using `planningStatus` as the only planning-stage workflow?
- Am I confusing thematic tags, maturity, visibility or status metadata with planning status?
- Am I editing the right source of truth?
- Will this affect routing, dependencies, display IDs or timeline sequencing?
- Am I adding a display workaround instead of fixing JSON?
- Do I need to preserve backwards compatibility?
- Does this imply false maturity for pre-draft content?
- Am I using reveal as progressive disclosure rather than security?
- Should this decision be recorded in `docs/repository-memory.md`?

## When to update repository memory

Update `docs/repository-memory.md` when a decision changes how future agents should behave or how the repository should be understood.

Do not update repository memory for every small copy edit, CSS tweak or data correction. It is for durable context, not a changelog.
