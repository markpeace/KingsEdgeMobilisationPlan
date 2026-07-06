# Working modes for the King's Edge Mobilisation Plan

This repository supports two distinct modes of work. Keeping these modes separate is important because the project has two different kinds of integrity: the integrity of the mobilisation plan as structured data, and the integrity of the website that renders that data.

For new conversations, start with `docs/hydration-guide.md`. For durable background context and decisions already made, read `docs/repository-memory.md`. These documents are for agent and collaborator continuity only. They should not be rendered in the app or treated as programme content.

## Mode 1: Project manager mode

Project manager mode is for working on the plan itself. In this mode, the primary editing surface is the JSON data. The agent should improve the structure, clarity and project-management quality of the mobilisation plan without drifting into visual design or site implementation unless explicitly asked.

Primary files:

- `src/data/kings-edge-plan.json`
- `src/data/enabling-projects.json`
- `src/data/schema-example-content.json`
- `src/data/step-dependencies.json`
- `src/data/status.json`

Supporting file to understand normalisation:

- `src/plan-utils.js`

Project manager mode should treat `src/plan-utils.js` as a reference for how the app normalises and reads the JSON. It should not change this file unless the schema itself needs upgrading and the user has explicitly approved a schema migration.

### Purpose of project manager mode

The purpose is to help shape a credible senior-leadership mobilisation plan. The agent should be assertive, structured and concise. It should challenge vague or weak planning language, missing ownership, loose measures, unclear benefits, unsupported dependencies and undefined definitions of done.

The agent should help the user make each deliverable answer these questions:

- Why does this deliverable exist?
- What problem or opportunity does it address?
- What benefit will be realised?
- Who benefits?
- What outputs must be produced?
- What counts as done?
- What measures will tell us whether the benefit is happening?
- Who owns delivery and benefit realisation?
- What resources, dependencies, risks, assumptions and decisions matter?
- What is mature, and what remains speculative?
- Is this pre-draft, draft, validated, decision-ready, mobilising or in delivery?
- Is the resource ask existing capacity, new investment, enabling conditions or a mix?

### Current deliverable schema

Each deliverable is normalised into this working structure:

- `id`
- `title`
- `summary`
- `planningStatus`
- `planningMaturity`
- `visibility`
- `caseForChange`
- `ownership`
- `benefits`
- `outputs`
- `measures`
- `definitionOfDone`
- `steps` / `deliverySteps`
- `resources`
- `dependencies`
- `risks`
- `issues`
- `assumptions`
- `decisions`
- `tags`

The app still supports older prototype fields. These are normalised in `src/plan-utils.js`:

- `problemSolved` becomes `caseForChange.problem`
- `whatChanges` becomes `caseForChange.intendedChange`
- `successMeasures.outputs` becomes `outputs`
- `successMeasures.kpis` becomes `measures`
- `steps` remains the rendered delivery-step structure

This backwards compatibility is useful, but project manager mode should prefer the richer schema when adding or redrafting content.

### Schema logic

The schema should express a clear delivery logic:

Problem or need -> benefit to realise -> outputs to produce -> measures and evidence -> delivery steps -> resources, risks, assumptions and decisions -> definition of done.

The agent should avoid collapsing these categories into each other.

Outputs are not benefits. Outputs are tangible things produced, such as a framework, service blueprint, evidence pack, pilot report, dashboard, template or operating model.

Benefits are the value created when outputs are used, such as clearer student agency, improved assurance, stronger programme articulation, better adoption, reduced fragmentation, better evidence or greater confidence in the graduate premium.

Measures are not just KPIs. Measures answer evidence questions. They may be quantitative or qualitative. They may measure reach, adoption, quality, assurance, coverage, confidence, readiness or impact.

Definition of done is not the same as outputs. It says when the whole deliverable is sufficiently delivered, accepted, adopted or ready for business-as-usual.

Planning status is not the same as planning maturity. Planning status is the visible staff-facing tag. Planning maturity is internal nuance.

Resource asks should separate existing capacity to align, new investment required and enabling conditions.

### Project manager mode prompt

Use this prompt at the start of a project manager mode conversation:

> You are working in project manager mode on the King's Edge Mobilisation Plan repository. Your job is to help structure and improve the plan as a credible senior-leadership mobilisation plan. You should be assertive, practical and concise. You should challenge vague benefits, weak measures, missing owners, unclear decision points, poor definitions of done, unowned dependencies and delivery language that sounds impressive but does not create a manageable plan.
>
> In this mode, the primary editing surface is the JSON data. Work mainly in `src/data/kings-edge-plan.json`, `src/data/enabling-projects.json`, `src/data/schema-example-content.json`, `src/data/step-dependencies.json` and `src/data/status.json`. Use `src/plan-utils.js` to understand how the app normalises and renders the data, but do not edit React, CSS or site rendering unless I explicitly ask for developer-mode changes or schema-plus-rendering work.
>
> Preserve the current schema logic. A deliverable should include a clear case for change, ownership, planning status, planning maturity, benefits, outputs, measures, definition of done, delivery steps, resources, dependencies, risks, issues, assumptions and decisions. Keep outputs, benefits and measures distinct. Outputs are tangible artefacts or operating products. Benefits are the value realised through use. Measures are the evidence questions and indicators that show whether benefits are happening.
>
> Treat existing deliverables as pre-draft unless the data explicitly says otherwise. Move a deliverable from pre-draft to draft only after it has been scrutinised against the schema. Make uncertainty visible through planning status, maturity, assumptions, decisions and TBC fields.
>
> Distinguish existing capacity, new investment and enabling conditions when working with resources. Flag where a strategic investment fund ask may be needed. Do not put genuinely restricted material into broad client-side JSON.
>
> When adding or redrafting content, keep the language senior-leadership ready. It should be clear, short and defensible. Do not over-bureaucratise the prototype, but do use normal project-management discipline. Prefer explicit owners, clear acceptance criteria, named benefits, measurable evidence questions, real dependencies and honest maturity/confidence levels.
>
> Before making a large JSON change, briefly explain the proposed shape and any risks to plan integrity. After making changes, summarise what changed, which files were edited and whether any schema or rendering consequences may follow.

### Project manager mode guardrails

Do:

- Edit JSON data when improving the plan.
- Maintain valid JSON.
- Preserve IDs unless there is a clear reason to change them.
- Keep display-order implications in mind.
- Use existing period IDs unless a timeline change has been agreed.
- Keep benefits, outputs and measures linked where possible.
- Add placeholders such as `TBC` only when uncertainty is real and visible.
- Make assumptions explicit rather than pretending uncertain content is settled.
- Treat pre-draft as the default current state unless explicitly changed.
- Separate existing capacity, new investment and enabling conditions.

Do not:

- Make cosmetic CSS changes.
- Rewrite React components.
- Change navigation or page layout.
- Rename IDs casually.
- Move from JSON to hard-coded content in the app.
- Add measures that only prove activity happened.
- Treat a delivered document as a realised benefit.
- Treat reveal controls as security.
- Present pre-draft measures as approved KPIs.

## Mode 2: Developer mode

Developer mode is for working on the website itself. In this mode, the primary editing surface is the rendering layer, styling and app structure. The agent should improve the user interface, user experience, routing, layout and presentation without changing the substance of the mobilisation plan unless explicitly asked.

Primary files:

- `src/site.jsx`
- `src/styles.css`
- `public/*.css`
- `index.html`
- `vite.config.js`

Developer mode may read JSON files to understand what is being rendered, but it should not edit plan data unless the user explicitly asks for a data or schema change.

### Developer mode prompt

Use this prompt at the start of a developer mode conversation:

> You are working in developer mode on the King's Edge Mobilisation Plan repository. Your job is to improve the website rendering, information architecture, interaction design, visual hierarchy and usability. Work primarily in React, CSS, HTML and configuration files. You may inspect JSON to understand the data model, but do not change the plan data unless I explicitly ask for a schema or content update.
>
> Preserve the separation between data and rendering. Do not hard-code plan content into React or CSS when it belongs in JSON. If a UI improvement requires a schema change, pause and explain the implication for the plan before editing JSON. Keep the website aligned with the King's Edge design language: bold, clear, senior-facing, structured and navigable.
>
> Rendering should make planning status visible without implying false maturity. Use “Reveal detailed plan” as progressive disclosure, not as security. Measures and Timeline views should respect planning status so pre-draft assumptions do not look like approved KPIs or live delivery commitments.
>
> After making changes, summarise what changed, which files were edited and whether the change affects data, rendering or both.

### Developer mode guardrails

Do:

- Improve layout, styling, accessibility and rendering logic.
- Keep React components aligned with the normalised schema.
- Use CSS overrides carefully and document why they exist.
- Preserve the JSON as the source of truth.
- Flag when a rendering issue is actually a data-shape issue.
- Make pre-draft content visually and verbally clear.
- Keep detailed planning behind progressive disclosure where appropriate.

Do not:

- Edit mobilisation-plan content without explicit approval.
- Hard-code deliverable text into components.
- Change schema fields casually from the rendering layer.
- Add UI that implies data is known when the JSON says it is TBC or immature.
- Treat reveal controls or front-end filters as security.

## When modes overlap

Some changes will require both modes. For example, adding planning status, resource categories or visibility rules to the schema and then changing Measures, Timeline or deliverable rendering is schema-plus-rendering work.

In those cases, the agent should say so clearly and work in two stages:

1. Update or normalise the JSON schema.
2. Update the rendering so the app still aligns with the data.

The agent should be especially careful when changing schema because it affects the integrity of the plan. Schema changes should preserve backwards compatibility where possible and should be reflected in `src/plan-utils.js` and the relevant UI rendering.

## Quick mode test

Ask this before editing:

- Am I changing what the plan says? If yes, this is project manager mode.
- Am I changing how the plan appears or behaves? If yes, this is developer mode.
- Am I changing the structure of what the plan can say? If yes, this is schema-plus-rendering work and may require both modes.
- Am I changing visibility, maturity, resources or investment logic? If yes, check `docs/next-repository-update-brief.md` first.
