# Next implementation brief

Background planning document. Do not render this file in the app.

The next implementation task is source-of-truth cleanup before the full content redraft.

## Current position

The app now renders a `planningStatus` tag and a “Reveal detailed plan” pattern. The documentation now makes clear that `planningStatus` is the only canonical planning-stage workflow.

However, a new-chat hydration test exposed two remaining problems:

1. The repo still contains multiple status/tag-like concepts that can confuse agents.
2. The desired project order and numbering are still partly achieved through programmatic display remapping rather than source JSON.

Read `docs/schema-source-of-truth-audit.md` before implementing the next change.

## Canonical planning-stage workflow

Use `planningStatus` only.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Do not use these as planning-stage workflows:

- `tags`
- `planningMaturity`
- `visibility`
- `src/data/status.json`

All current deliverables default to `pre-draft` unless explicitly moved to a later `planningStatus`.

## Canonical project order

The desired source order and numbering is:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

The source JSON should carry this order directly. The frontend should not have to remap IDs, titles or order to make the plan look correct.

## Current cleanup needed

### 1. Migrate source JSON

Update `src/data/kings-edge-plan.json` so that project IDs, project titles and project order match the canonical order.

Recommended ID map:

- old `2.4` -> new `2.1`
- old `2.1` -> new `2.2`
- old `2.2` -> new `2.3`
- old `2.3` -> new `2.4`

Apply this to:

- project IDs;
- deliverable IDs;
- step IDs;
- dependency `targetId` values;
- step `dependsOn` arrays;
- `feedsInto`;
- `relatedDeliverables`;
- cross-programme dependency references.

### 2. Migrate related data files

Update related data files using the same ID map:

- `src/data/schema-example-content.json`
- `src/data/step-dependencies.json`
- `src/data/status.json`, if retained

Important: `src/data/status.json` is not the planning-stage workflow. It is hidden delivery-control metadata.

### 3. Remove display-remapping workarounds

After source JSON is migrated, simplify `src/plan-utils.js`.

Remove or neutralise:

- `edgeDisplayOrder`
- `edgeDisplayIds`
- `edgeDisplayTitles`
- `displayIdForProject`
- `displayTitleForProject`
- `displayIdForDeliverable`
- sorting based on display order rather than source order

The app should render source IDs and source order directly.

### 4. Check rendering

After migration, check:

- project board order;
- project detail pages;
- deliverables index codes and project context line;
- deliverable detail hero context line;
- measures view links;
- timeline rows and dependency links;
- step dependency modal links;
- schema example content rendering;
- status pills remain hidden unless explicitly reintroduced.

## Content redraft comes after cleanup

Only after this source-of-truth cleanup should the deliverable-by-deliverable content redraft begin.

For each deliverable, move from `pre-draft` to `draft` only after scrutiny of:

- case for change;
- ownership;
- benefits;
- outputs;
- measures;
- definition of done;
- delivery steps;
- dependencies;
- resources;
- investment ask, if any;
- risks, issues, assumptions and decisions.

## Risks to manage

### Risk: broken links after ID migration

Mitigation: migrate all IDs and references together, including steps, dependencies, feeds, related deliverables, schema examples and status entries.

### Risk: reintroducing display workarounds

Mitigation: fix source JSON first. Simplify `src/plan-utils.js` after migration.

### Risk: confusing planning status with other metadata

Mitigation: use `planningStatus` only for the pre-draft to delivery workflow. Treat tags, maturity, visibility and status metadata as secondary.

### Risk: false security through reveal controls

Mitigation: do not put genuinely restricted material into broad client-side JSON.

## Next practical move

Perform the canonical project ID/order migration across JSON data, then remove the display-remapping code from `src/plan-utils.js`.
