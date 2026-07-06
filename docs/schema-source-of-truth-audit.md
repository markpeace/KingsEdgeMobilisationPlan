# Schema source-of-truth audit

Background repository memory only. Do not render this file in the app.

This audit records the tagging and project-order source-of-truth decisions that were clarified during the repository cleanup.

## Migration status

Applied.

`src/data/kings-edge-plan.json` now carries the canonical project order and project IDs directly:

1. `2.1` Articulating and Evidencing The King's Graduate Premium
2. `2.2` Curriculum Embedded Graduate Advantage
3. `2.3` Co-Curricular Opportunity to Go Further
4. `2.4` Extra Curricular Provision for Belonging and Participation

`src/plan-utils.js` no longer performs project display-ID, display-title or display-order remapping. It now renders source IDs and source order.

`src/data/schema-example-content.json` has been retired as an overlay so it cannot silently override source data.

`src/data/step-dependencies.json` has been cleared because the previous override set referred to the old ID model. Step dependencies should now live in the source plan data unless there is a clear reason to add an explicit override.

`src/data/status.json` has been cleared of item-specific entries because those entries referred to the old ID model and were not the planning-stage workflow.

## Canonical planning-stage workflow

Use `planningStatus`.

Allowed values:

- `pre-draft`
- `draft`
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

This is the only workflow that should be described as the planning-stage tag.

Do not use these fields as planning-stage workflow:

- `tags`
- `planningMaturity`
- `visibility`
- `src/data/status.json`

## Source-of-truth principle

The JSON source should carry the plan as agreed.

The frontend should render that source data. It should not use hidden remapping to make old source data look correct.

Acceptable utility work in `src/plan-utils.js` includes:

- schema normalisation;
- timeline period mapping;
- lookup construction;
- dependency indexing;
- backwards compatibility for older fields where it does not change IDs, titles or project order.

Unacceptable utility work includes:

- hidden project renumbering;
- hidden project reordering;
- hidden title substitution;
- applying richer content overlays from another data file without making that clear in the source of truth.

## Guardrail for future agents

Do not add another tagging workflow.

Use `planningStatus` for the workflow from pre-draft to delivery. Treat other labels as secondary metadata only.

Do not add display remapping to hide source data problems. If the plan order, numbering or title is wrong, fix the JSON source of truth.
