# Plan versions

Version 1 is the original plan in `src/data/`. Version 2 is an independent working copy in `src/data/v2/`. The selector in the site header uses `?plan=v2` for Version 2 and the existing URL for Version 1. It retains the current page hash when switching. The default remains Version 1.

The copy includes the core programme, related projects, all registered deliverable parts, dependencies, statuses, shared resource records, reconciliation rules, theory of change and project context. The application code and schemas are shared; plan content is selected as a bundle in `src/plan-data.js`. Editing Version 2 JSON cannot change Version 1 content. The investment case page remains a separate fixed document and should be reviewed before treating it as a Version 2 investment case.

`docs/plan-v1-baseline.json` records SHA-256 hashes of the 106 original source files at the source commit. `npm run validate:data` checks that Version 1 remains intact, that Version 2 still has an independent file for each baseline file, and validates both data bundles. At the initial creation, `node scripts/validate-plan-versions.mjs --initial-parity` proves that the two bundles are byte-for-byte identical. Future Version 2 edits can diverge while the preserved Version 1 baseline stays fixed.

Version 2 currently has the same structure and content as Version 1. Before renumbering, moving or splitting deliverables, create a migration map for original IDs, steps, benefits, measures, dependencies and resource asks. Keep an explicit destination or disposition for each original item, then update the Version 2 registry and references together. This guards against losing content while revising the project and deliverable architecture.
