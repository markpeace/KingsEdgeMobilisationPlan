# Working modes for the King's Edge Mobilisation Plan

This repository supports two distinct modes of work: project manager mode and developer mode.

Start new conversations with `docs/hydration-guide.md`. Then read `docs/deliverable-schema.md`, `docs/json-spine.md`, `docs/repository-memory.md` and `docs/schema-source-of-truth-audit.md`.

These docs are for agent and collaborator continuity only. Do not render them in the app or treat them as programme content.

## Current critical rules

### One planning-stage workflow

Use `planningStatus` as the only planning-stage workflow.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Do not use `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` as the planning-stage workflow.

### Canonical project order

The current source JSON carries this project order directly:

1. `2.1` Curriculum Embedded Graduate Advantage
2. `2.2` A Co-Curricular Scaffold for Purpose
3. `2.3` An Extra-Curricular Invitation to Participate
4. `2.4` Articulating and Evidencing The King's Graduate Premium

Do not add display-remapping workarounds. If project order, title or numbering is wrong, fix the JSON source of truth.

## Mode 1: Project manager mode

Project manager mode is for working on the plan itself. The primary editing surface is JSON data.

Primary files:

- `src/data/kings-edge-plan.json`
- `src/data/deliverables/<deliverable-id>/*.json`
- `src/data/deliverables/manifest.json`
- `src/data/enabling-projects.json`
- `src/data/step-dependencies.json`
- `src/data/status.json`

Supporting file:

- `src/plan-utils.js`

Project manager mode may read `src/plan-utils.js` to understand normalisation, but should not change rendering unless the user explicitly asks for schema-plus-rendering work.

### Purpose

Help shape a credible senior-leadership mobilisation plan. Be assertive, practical and concise. Challenge vague benefits, weak measures, missing owners, unclear decisions, poor definitions of done, unowned dependencies and language that sounds strategic but is not yet manageable.

Each deliverable should answer:

- Why does this deliverable exist?
- What problem or opportunity does it address?
- What benefit will be realised?
- Who benefits?
- What outputs must be produced?
- What counts as done?
- What measures will tell us whether the benefit is happening?
- Who owns delivery and benefit realisation?
- What resources, dependencies, risks, assumptions and decisions matter?
- What is the `planningStatus`?
- Is the resource ask existing capacity, new investment, enabling conditions or a mix?

### Project manager mode prompt

Use this prompt at the start of a project manager mode conversation:

> You are working in project manager mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/hydration-guide.md`, `docs/deliverable-schema.md`, `docs/json-spine.md`, `docs/repository-memory.md`, `docs/schema-source-of-truth-audit.md`, `docs/next-repository-update-brief.md`, `src/plan-utils.js` and the relevant JSON files under `src/data/`.
>
> In this mode, the primary editing surface is JSON data. Work mainly in `src/data/kings-edge-plan.json`, `src/data/deliverables/<deliverable-id>/*.json`, `src/data/deliverables/manifest.json`, `src/data/enabling-projects.json`, `src/data/step-dependencies.json` and `src/data/status.json`. Do not edit React, CSS or site rendering unless explicitly asked for developer-mode or schema-plus-rendering work.
>
> The only canonical planning-stage workflow is `planningStatus`: `pre-draft`, `draft`, `validated-draft`, `decision-ready`, `mobilising`, `in-delivery`. Do not use generic `tags`, `planningMaturity`, `visibility`, or `src/data/status.json` for that workflow. Treat all current deliverables as `pre-draft` unless the JSON explicitly says otherwise.
>
> Preserve the schema logic: problem or need, benefit to realise, outputs to produce, measures and evidence, delivery steps, resources, dependencies, risks, assumptions and decisions, definition of done. Keep benefits, outputs and measures distinct.
>
> The canonical project order and IDs are already in `src/data/kings-edge-plan.json`. Do not add display-remapping workarounds. If project order, title or numbering is wrong, fix the JSON source of truth.
>
> Recommended rhythm: first sharpen project titles, summaries and transformation claims; then work through deliverables in order to move them from `pre-draft` to `draft`.
>
> Before making a large JSON change, briefly explain the proposed shape and any risks to plan integrity. After making changes, summarise what changed, which files were edited and whether any schema or rendering consequences may follow.

### Project manager guardrails

Do:

- Edit JSON data when improving the plan.
- Use `src/data/deliverables/<deliverable-id>/` for detailed deliverable files and keep the manifest explicit.
- Maintain valid JSON.
- Use `planningStatus` for the planning-stage workflow.
- Treat current deliverables as `pre-draft` unless explicitly changed.
- Preserve IDs unless there is an agreed ID migration.
- If migrating IDs, update dependencies, steps, feeds and related deliverables together.
- Keep benefits, outputs and measures distinct.
- Separate existing capacity, new investment and enabling conditions.
- Make uncertainty explicit.

Do not:

- Create another tagging workflow.
- Use `tags`, `planningMaturity`, `visibility`, or `status.json` as the planning-stage workflow.
- Add display-remapping workarounds for project order or numbering.
- Make cosmetic CSS changes.
- Rewrite React components unless explicitly asked.
- Hard-code plan content into the app.
- Add measures that only prove activity happened.
- Treat a delivered document as a realised benefit.
- Treat reveal controls as security.

## Mode 2: Developer mode

Developer mode is for working on the website itself. The primary editing surface is React, CSS, HTML and configuration.

Primary files:

- `src/site.jsx`
- `src/styles.css`
- `public/*.css`
- `index.html`
- `vite.config.js`

Developer mode may read JSON files to understand the data model, but should not edit plan data unless the user explicitly asks for a data or schema change.

### Developer mode prompt

Use this prompt at the start of a developer mode conversation:

> You are working in developer mode on the King's Edge Mobilisation Plan repository. Hydrate yourself before editing. Read `docs/hydration-guide.md`, `docs/deliverable-schema.md`, `docs/json-spine.md`, `docs/repository-memory.md`, `docs/schema-source-of-truth-audit.md`, `src/plan-utils.js`, `src/site.jsx`, relevant CSS files in `public/` and `src/styles.css`.
>
> In this mode, treat rendering as the primary editing surface. Work mainly in React, CSS, HTML and configuration. You may inspect JSON to understand the data model, but do not change plan data unless explicitly asked.
>
> Preserve the separation between data and rendering. Do not hard-code plan content into React or CSS. Do not add display-remapping workarounds to hide source-data problems. If a UI improvement requires a schema or ID change, pause and explain the implication for the plan before editing JSON.
>
> Rendering should make `planningStatus` visible without implying false maturity. Treat “Reveal detailed plan” as progressive disclosure, not security. Measures and Timeline views should respect planning status.
>
> After making changes, summarise what changed, which files were edited and whether the change affects data, rendering or both.

### Developer guardrails

Do:

- Improve layout, styling, accessibility and rendering logic.
- Keep React components aligned with the normalised schema.
- Preserve JSON as the source of truth.
- Flag when a rendering issue is actually a data-shape issue.
- Make pre-draft content visually and verbally clear.

Do not:

- Edit mobilisation-plan content without explicit approval.
- Hard-code deliverable text into components.
- Change schema fields casually from the rendering layer.
- Add UI that implies data is known when the JSON says it is TBC or immature.
- Treat reveal controls or front-end filters as security.
- Add display remapping when source data should be migrated instead.

## When modes overlap

Some changes require both modes. For example, a schema change may affect JSON data, dependency references and rendering utilities.

In those cases, work in stages:

1. Update the JSON source of truth.
2. Update related JSON references.
3. Update or simplify normalisation utilities.
4. Check the app still renders correctly.

## Quick mode test

Ask this before editing:

- Am I changing what the plan says? If yes, this is project manager mode.
- Am I changing how the plan appears or behaves? If yes, this is developer mode.
- Am I changing source IDs, ordering or schema? If yes, this is schema-plus-rendering work.
- Am I using `planningStatus` as the only planning-stage workflow?
- Am I fixing source data rather than adding a display workaround?
