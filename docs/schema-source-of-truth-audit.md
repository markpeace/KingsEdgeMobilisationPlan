# Schema source-of-truth audit

Background repository memory only. Do not render this file in the app.

This audit records the places where the repository currently contains historical schema workarounds or multiple status/tagging concepts. It exists because future project-manager-mode chats were getting confused about which tagging workflow and project order are canonical.

## Executive finding

Two things need tightening.

First, the canonical planning-stage workflow is `planningStatus`:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

This is the only workflow that should be described as the planning-stage tag. Generic `tags`, `planningMaturity`, and `src/data/status.json` are not the planning-stage workflow.

Second, the visible project order is currently still partly achieved through programmatic display remapping in `src/plan-utils.js`. That is not the desired end state. The desired end state is that `src/data/kings-edge-plan.json` carries the canonical project IDs, project titles and project order directly, and the frontend simply renders that source data.

## Canonical project order

The source JSON should ultimately carry this order and numbering directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

Current issue: `src/data/kings-edge-plan.json` still stores the older order and older project IDs:

1. `2.1` Curriculum-Embedded Graduate Premium
2. `2.2` Co-Curricular Opportunity and Purpose
3. `2.3` Extra-Curricular Student Life, Navigation and Belonging
4. `2.4` Evidence and Articulation of the King's Graduate Premium

The app currently masks this through `src/plan-utils.js`. That should be removed after data migration.

## Current workaround locations

### `src/plan-utils.js`

Current display workarounds:

- `edgeDisplayOrder`
- `edgeDisplayIds`
- `edgeDisplayTitles`
- `displayIdForProject`
- `displayTitleForProject`
- `displayIdForDeliverable`
- `compareProjects` using display order

These exist to show the revised project order and numbering without changing source JSON. They should be treated as temporary compatibility code. The desired end state is to remove these display-remapping rules once source JSON has been migrated.

### `src/data/kings-edge-plan.json`

Current source-of-truth issue:

- project order is still the old order;
- project IDs are still the old IDs;
- deliverable IDs, step IDs, dependencies, `feedsInto`, `relatedDeliverables`, and cross-programme references still use the old numbering.

This file should be the main target of the canonical project renumbering migration.

### `src/data/schema-example-content.json`

Current source-of-truth issue:

- richer schema example content is keyed to old `2.2.1` for King's Canvas;
- output IDs, benefit IDs, measure IDs and step extras also use old `2.2.1` IDs.

If King's Canvas becomes `2.3.1` in canonical JSON, this example content must be migrated or merged into the main plan data under the new ID.

### `src/data/step-dependencies.json`

Current source-of-truth issue:

- step dependency overrides may refer to old step IDs.

This file needs an ID migration at the same time as `kings-edge-plan.json`.

### `src/data/status.json`

Current source-of-truth issue:

- status entries use older IDs;
- values such as `scoping`, `active`, `not-started` are delivery-control/status values, not the planning-stage workflow;
- status pills are currently hidden in the app, so this file should not be treated as the canonical planning-stage tag source.

Do not use `src/data/status.json` to decide whether a deliverable is `pre-draft`, `draft`, `validated-draft`, `decision-ready`, `mobilising`, or `in-delivery`.

### Documentation

Current documentation risk:

- `tags`, `planningStatus`, `planningMaturity`, `visibility`, and `status.json` all exist as concepts;
- future agents can mistake this for multiple competing tagging schemas.

Documentation should be explicit: the only planning-stage workflow is `planningStatus`. Generic `tags` are thematic and optional. `planningMaturity` is internal nuance. `status.json` is hidden delivery-control metadata.

## Required cleanup sequence

### 1. Clarify documentation

Make all docs say clearly:

- use `planningStatus` for planning-stage tags;
- do not use `tags` for planning stage;
- do not use `planningMaturity` for planning stage;
- do not use `src/data/status.json` for planning stage;
- current deliverables default to `pre-draft` unless explicitly stated otherwise.

### 2. Migrate canonical project IDs and order in JSON

Migrate `src/data/kings-edge-plan.json` so it directly carries the desired numbering and order.

Recommended ID map:

- old `2.4` -> new `2.1`
- old `2.1` -> new `2.2`
- old `2.2` -> new `2.3`
- old `2.3` -> new `2.4`

Apply the same mapping to:

- project IDs;
- deliverable IDs;
- step IDs;
- dependency target IDs;
- step `dependsOn` arrays;
- `feedsInto`;
- `relatedDeliverables`;
- cross-programme dependency references;
- schema example content;
- step dependency overrides;
- status entries, if retained.

### 3. Remove display remapping from app utilities

After the source JSON has been migrated, simplify `src/plan-utils.js` so it renders the source data rather than remapping it.

Remove or neutralise:

- `edgeDisplayOrder`
- `edgeDisplayIds`
- `edgeDisplayTitles`
- custom display ID substitution
- custom display-title substitution

Project sorting should follow source JSON order, or an explicit `order` field in the source JSON if one is added.

### 4. Re-check app rendering

After migration, test:

- project board order;
- deliverables index order and codes;
- deliverable detail project context line;
- timeline rows and dependency links;
- measure view links;
- schema example content rendering;
- status pills remain hidden unless explicitly reintroduced.

## Guardrail for future agents

Do not add another tagging workflow.

Use `planningStatus` for the workflow from pre-draft to delivery. Treat other labels as secondary metadata only.

Do not add display remapping to hide source data problems. If the plan order or numbering is wrong, fix the JSON source of truth.
