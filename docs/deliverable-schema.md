# Deliverable schema reference

This document describes the working project and deliverable schema for the King's Edge Mobilisation Plan.

The key principle is that each deliverable should be understandable as a project-management object: why it exists, who owns it, what value it creates, what it produces, how it is evidenced, what it needs and what would count as done.

Current planning assumption: all existing deliverables are `pre-draft` until each one has been scrutinised against this schema.

## Canonical planning-stage workflow

There is one canonical planning-stage workflow.

Use `planningStatus`.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Default for current deliverables: `pre-draft`.

Meanings:

- `pre-draft`: included in the mobilisation map, but not yet scrutinised against the full schema.
- `draft`: reviewed against the schema and coherent as a planning object, but not approved.
- `validated-draft`: checked with relevant owners, contributors or stakeholders.
- `decision-ready`: mature enough for a decision about priority, investment, ownership, sequencing or mobilisation.
- `mobilising`: relevant decision made and delivery is being organised.
- `in-delivery`: work is actively underway.

A deliverable should only move from `pre-draft` to `draft` after these have been scrutinised: case for change, ownership, benefits, outputs, measures, definition of done, steps, dependencies, resources, risks, assumptions and decisions.

Do not use any other field as the planning-stage tag.

## Fields that are not the planning-stage workflow

The repo contains other fields that can look like tags or statuses. They are not the planning-stage workflow.

- `tags`: optional thematic keywords only. Do not use for planning stage. These may be removed or ignored if they confuse the workflow.
- `planningMaturity`: internal nuance about the type of planning work underway. It is not the staff-facing stage.
- `src/data/status.json`: hidden delivery-control metadata for status/confidence/decision-needed. It is not the planning-stage tag source.
- `visibility`: handling and rendering guidance. It is not planning stage and it is not security.

Project manager mode should treat `planningStatus` as the only source for the pre-draft to delivery workflow.

## Canonical project order and source of truth

The source JSON now carries the canonical project order and numbering directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

The frontend should render the source data, not compensate for old ordering through display remapping.

`src/plan-utils.js` should not contain hidden project ID, title or order remapping. If project order, title or numbering is wrong, fix `src/data/kings-edge-plan.json`.

## Project fields

Each project should be able to carry these fields:

- `id`: stable project identifier, such as `2.1`.
- `title`: public project title.
- `owner`: accountable project owner.
- `summary`: short card-facing essence.
- `detailSummary`: optional fuller explanation for the project detail page.
- `transformationClaim`: the institutional change this project is trying to make possible.
- `deliverables`: the deliverables grouped under the project.

`transformationClaim` should not simply restate the summary. It should express the shift the project enables, for example what becomes more visible, more systematic, more scalable, more equitable, more evidenceable or more actionable because the project exists.

The project detail page should render the transformation claim as a prominent leadership-facing statement when it is authored.

## Summary fields

Projects and deliverables should separate card-level summary from detail-page explanation.

- `summary`: short card-facing essence. It should usually be one clear sentence and should work on project cards, deliverable cards and index rows.
- `detailSummary`: optional fuller explanation for project and deliverable detail pages. Use this when the reader needs a richer explanation after the headline summary.

Do not force all descriptive content into `summary`. The first line should capture the proposition, but the detail page can carry a more developed description through `detailSummary`.

Backwards compatibility: `description` or `longSummary` may be normalised into `detailSummary`, but new content should use `detailSummary`.

## Core deliverable fields

Each deliverable should be able to carry these fields:

- `id`: stable machine-readable identifier, such as `2.3.1`.
- `title`: public title.
- `summary`: short card-facing essence.
- `detailSummary`: optional fuller explanation for detail pages.
- `planningStatus`: the canonical planning-stage workflow field.
- `planningMaturity`: optional internal planning nuance.
- `visibility`: handling and rendering guidance.
- `caseForChange`: why the deliverable exists.
- `ownership`: accountable owner, delivery lead, benefit owner, contributors and decision forum.
- `benefits`: value to be realised through use.
- `outputs`: tangible things to produce.
- `measures`: evidence questions or indicators.
- `definitionOfDone`: conditions for the deliverable to be considered delivered, accepted or ready for handover.
- `steps` / `deliverySteps`: sequenced work.
- `resources`: existing capacity, new investment and enabling conditions.
- `dependencies`: typed links to other work.
- `risks`, `issues`, `assumptions`, `decisions`: lightweight RAID-style planning.
- `tags`: optional thematic keywords only.

IDs should not be changed casually. If IDs are migrated, update dependencies, steps, feeds and related deliverables at the same time.

## Case for change

Field: `caseForChange`

Subfields:

- `problem`: the problem, gap or need.
- `opportunity`: what becomes possible if the work is done well.
- `whyNow`: why this matters now.
- `intendedChange`: the change the deliverable is expected to create.

Backwards compatibility:

- `problemSolved` is normalised into `caseForChange.problem`.
- `whatChanges` is normalised into `caseForChange.intendedChange`.

## Ownership

Field: `ownership`

Subfields:

- `accountableOwner`: senior owner accountable for the deliverable.
- `deliveryLead`: person or role leading the work.
- `benefitOwner`: person or role accountable for realising the benefit after outputs are produced.
- `contributors`: teams, roles or groups involved.
- `decisionForum`: forum where decisions or escalations should go.

The older `lead` field is still used and is normalised into `ownership.deliveryLead` when needed.

## Benefits, outputs and measures

Keep these separate.

Benefits describe value realised when outputs are used. They are not tasks and not documents.

Outputs are tangible things produced by the work: frameworks, reports, dashboards, packs, blueprints, operating models, templates or pilots.

Measures answer evidence questions. They may be quantitative or qualitative. They should test whether the intended benefit is happening, not just prove that activity occurred.

## Definition of done

Field: `definitionOfDone`

A strong definition of done may include:

- outputs delivered and accepted;
- benefit owner confirmed;
- measures agreed and baselined where possible;
- dependencies resolved or actively managed;
- adoption or business-as-usual route agreed;
- decisions made or escalated;
- resource implications understood.

Definition of done applies to the whole deliverable. Output acceptance criteria apply to individual outputs.

## Delivery steps

Fields: `steps` and `deliverySteps`

Useful subfields:

- `id`
- `title`
- `stepType`
- `period`
- `summary`
- `dependsOn`
- `outputsProduced`
- `resources`
- `decisions`
- `risks`
- `issues`
- `assumptions`
- `visibility`

Steps should be sequenced enough to support the timeline. They do not need to become a full task plan.

Timeline view should respect `planningStatus`. Pre-draft steps should be visually framed as indicative.

## Resources

Field: `resources`

Resources should distinguish:

- `existingCapacity`: existing staff time, expertise, governance time, data access, digital input or operational capacity that needs to be aligned or prioritised.
- `newInvestment`: genuine additional cash investment, including strategic investment fund asks, fixed-term roles, consultancy, digital build, evaluation, incentives, events or tooling.
- `enablingConditions`: non-cash conditions such as governance route, data access, roadmap prioritisation, faculty participation or system integration.
- `fundingSummary`: short resource summary.
- `investmentAsk`: senior-facing summary of whether new funding is needed and what it unlocks.

Backwards compatibility:

- `people` maps to `existingCapacity`.
- `cashCosts` maps to `newInvestment`.
- `dataAndSystems`, `governance`, `engagementNeeds` and `nonCashNeeds` map to `enablingConditions`.

## Visibility

Field: `visibility`

Allowed values:

- `staff-visible`
- `internal-planning`
- `restricted`

Visibility is presentation guidance, not access control.

A reveal button is not security. If content is genuinely sensitive, do not ship it in a broad client-side app bundle unless there is real authentication or a separate restricted build.

## Dependencies

Field: `dependencies`

Useful subfields:

- `id`
- `dependsOn` or `targetId`
- `dependencyType`
- `criticality`
- `description`
- `owner`
- `status`

Dependencies should explain the type of dependency and why it matters.

## RAID-style fields

Use lightweight RAID fields where useful:

- `risks`: things that may happen and affect delivery or benefit realisation.
- `issues`: current problems needing action.
- `assumptions`: things being treated as true for planning purposes.
- `decisions`: choices that need to be made.

These fields are usually detailed planning material. For pre-draft deliverables, they should sit behind the detailed-plan reveal and be treated as working assumptions.

## Normalisation in the app

The normalisation logic lives in `src/plan-utils.js`. It keeps old and new data rendering while the prototype evolves.

Acceptable normalisation:

- backwards compatibility for older field names;
- `description` or `longSummary` into `detailSummary`;
- defaulting project `transformationClaim` to blank when unauthored;
- timeline period mapping;
- lookup construction;
- dependency indexing;
- resource-shape normalisation.

Do not use normalisation for hidden project renumbering, title substitution or order remapping.

Project manager mode should prefer adding richer fields directly to the JSON rather than relying on fallbacks.

## Rendering implications

Cards and index rows should use `summary` only.

Project and deliverable detail pages should render `summary` first, then render `detailSummary` underneath when it exists and is distinct from `summary`.

Project detail pages should also render `transformationClaim` as a distinct panel when it exists.

Deliverable pages should show a staff-safe summary first, then allow users to reveal detailed planning.

Default visible deliverable view:

- deliverable code;
- project code and title;
- planning status;
- title;
- summary;
- detail summary, where authored;
- accountable owner;
- delivery lead;
- case for change;
- current planning focus;
- next scrutiny step.

Revealed detailed plan:

- benefits;
- outputs and acceptance criteria;
- measures and evidence questions;
- definition of done;
- resources;
- investment ask;
- dependencies;
- risks;
- issues;
- assumptions;
- decisions;
- detailed delivery steps.

For pre-draft deliverables, the revealed detail should carry clear context: detailed planning fields are working assumptions and will be refined through deliverable-level scrutiny.

## Editing principles

When editing project JSON:

- keep valid JSON;
- preserve IDs unless explicitly migrating them;
- use `summary` for concise card-facing essence;
- use `detailSummary` for fuller detail-page explanation;
- use `transformationClaim` for the institutional shift the project enables.

When editing deliverable JSON:

- keep valid JSON;
- preserve IDs unless explicitly migrating them;
- use `summary` for concise card-facing essence;
- use `detailSummary` for fuller detail-page explanation;
- do not mix benefits, outputs and measures;
- use `planningStatus` for the planning-stage workflow;
- do not create another tagging workflow;
- make ownership visible;
- make uncertainty visible;
- keep senior-facing copy concise;
- use measures to test benefits, not just activity;
- separate existing capacity, new investment and enabling conditions;
- do not put genuinely restricted material into broad client-side app data;
- ensure schema changes are reflected in rendering when needed.
