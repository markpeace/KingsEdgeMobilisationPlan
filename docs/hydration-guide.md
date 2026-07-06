# New chat hydration guide

Use this guide when starting a new conversation about the King's Edge Mobilisation Plan repository.

The goal is to give a new agent enough context to continue from the current state without relying on private chat memory.

## Start here

Before editing anything, read these files in this order:

1. `docs/hydration-guide.md`
2. `docs/working-modes.md`
3. `docs/deliverable-schema.md`
4. `docs/repository-memory.md`
5. `src/plan-utils.js`
6. Relevant JSON files under `src/data/`

If the task is about app rendering or UI, also inspect:

- `src/site.jsx`
- `src/styles.css`
- relevant files in `public/*.css`
- `index.html`

## Confirm the working mode

Before making changes, confirm which mode applies.

Project manager mode means the plan content, structure or schema is being changed. The primary editing surface is JSON.

Developer mode means the app rendering, layout, styling or interaction design is being changed. The primary editing surface is React, CSS, HTML and configuration.

Some work crosses both modes. Schema changes that also need rendering changes should be handled explicitly as schema-plus-rendering work.

## Project manager mode hydration prompt

Use the following prompt to start a new project manager mode chat:

You are working in project manager mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/working-modes.md`, `docs/deliverable-schema.md`, `docs/repository-memory.md`, `src/plan-utils.js` and the relevant JSON files under `src/data/`.

In this mode, treat JSON as the primary editing surface. Work mainly in `src/data/kings-edge-plan.json`, `src/data/enabling-projects.json`, `src/data/schema-example-content.json`, `src/data/step-dependencies.json` and `src/data/status.json`. Do not make React, CSS, layout or rendering changes unless I explicitly switch to developer mode or ask for schema-plus-rendering work.

Your role is to help structure the King's Edge mobilisation plan as a credible senior-leadership project plan. Be assertive, practical and concise. Challenge vague benefits, weak measures, missing owners, unclear decision points, unowned dependencies, poor definitions of done and language that sounds strategic but is not yet manageable.

Preserve the schema logic: problem or need, benefit to realise, outputs to produce, measures and evidence, delivery steps, resources, dependencies, risks, assumptions and decisions, definition of done.

Keep benefits, outputs and measures distinct. Outputs are things we produce. Benefits are value realised through use. Measures are evidence questions or indicators that show whether the benefit is happening.

Before making major JSON changes, explain the proposed shape and any risks to plan integrity. After changes, summarise which files changed and whether there are rendering consequences.

## Developer mode hydration prompt

Use the following prompt to start a new developer mode chat:

You are working in developer mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/working-modes.md`, `docs/deliverable-schema.md`, `docs/repository-memory.md`, `src/plan-utils.js`, `src/site.jsx`, relevant CSS files in `public/` and `src/styles.css`.

In this mode, treat the website rendering as the primary editing surface. Work mainly in React, CSS, HTML and configuration. You may inspect JSON to understand the data model, but do not change the plan data unless I explicitly ask for a schema or content update.

Preserve the separation between data and rendering. Do not hard-code plan content into React or CSS when it belongs in JSON. If a UI improvement requires a schema change, pause and explain the implication for the plan before editing JSON.

Keep the site aligned with the King's Edge design language: bold, clear, senior-facing, structured and navigable. After making changes, summarise what changed, which files were edited and whether the change affects data, rendering or both.

## Repo map

Core plan data:

- `src/data/kings-edge-plan.json`: core Edge programme, projects, deliverables and steps.
- `src/data/enabling-projects.json`: out-of-programme or enabling projects.
- `src/data/schema-example-content.json`: richer example schema content used to test benefits, outputs, measures and project-management fields.
- `src/data/step-dependencies.json`: step-level dependency overrides.
- `src/data/status.json`: status and confidence data.

Normalisation and ordering:

- `src/plan-utils.js`: combines data sources, applies display IDs and titles, normalises schema fields, builds lookups and dependency indexes.

Rendering:

- `src/site.jsx`: React app and page rendering.
- `src/styles.css`: base styling.
- `public/*.css`: focused style overrides for landing page, projects, timeline, schema sections, header, deliverable detail and project-management panels.
- `index.html`: loads the CSS files and app entry point.

Background documentation:

- `docs/working-modes.md`: explains project manager mode and developer mode.
- `docs/deliverable-schema.md`: describes the current deliverable schema.
- `docs/repository-memory.md`: background decisions and working assumptions. Do not render in the app.
- `docs/hydration-guide.md`: this file.

## Checks before editing

Ask these questions before changing files:

- Am I changing what the plan says? If yes, this is project manager mode.
- Am I changing how the plan appears or behaves? If yes, this is developer mode.
- Am I changing what the plan can say? If yes, this is a schema change and may require both modes.
- Am I editing the right source of truth?
- Will this affect routing, dependencies, display IDs or timeline sequencing?
- Do I need to preserve backwards compatibility?

## Hydration checklist for agents

Before making a substantive change, be able to state:

- the current working mode;
- the files you expect to edit;
- whether the change affects data, rendering or both;
- whether schema normalisation in `src/plan-utils.js` is involved;
- whether the change has implications for the app UI;
- whether any decisions should be added to `docs/repository-memory.md`.

## When to update repository memory

Update `docs/repository-memory.md` when a decision changes how future agents should behave or how the repository should be understood.

Examples:

- new working mode or guardrail;
- new schema principle;
- change to source-of-truth rules;
- decision to render or not render a data field;
- decision to preserve or change IDs;
- major shift in visual or data architecture;
- known caveat future agents must not miss.

Do not update repository memory for every small copy edit, CSS tweak or data correction. It is for durable context, not a changelog.
