# Initial Implementation Notes

The current implementation is a lightweight Vite / React site.

## Implemented views

- Overview page with four King's Edge project columns and sixteen deliverables
- Deliverables index with search, project, status and confidence filters
- Deliverable detail pages driven by JSON
- Timeline / Gantt-style view with step-level dependency highlighting
- Related projects page

## Implemented data sources

The core plan is held in:

```text
src/data/kings-edge-plan.json
```

Additional data sources are:

```text
src/data/enabling-projects.json
src/data/step-dependencies.json
src/data/status.json
```

The data includes:

- programme metadata
- timeline periods
- four King's Edge projects
- sixteen deliverables
- related portfolio projects
- components
- delivery steps
- step-to-step dependencies
- status and confidence values
- decision flags

## Current dependency treatment

The timeline includes a dependency lens.

Users can click a timeline step to show:

- the selected step
- what it depends on
- what it feeds into
- highlighted prerequisite and dependent blocks in the Gantt

Related projects are shown as projects in their own right. They can be included or hidden in the Gantt.

Dependencies are treated as step-to-step relationships, not as whole-project relationships.

## Status and confidence treatment

The site renders status and confidence badges on:

- overview cards
- deliverable index rows
- deliverable detail pages
- delivery step cards
- timeline rows and blocks
- related project cards

The status data is deliberately separate from the plan content so it can be updated frequently.

## Data validation

A lightweight validation script checks the plan, related projects, status entries and step dependencies:

```bash
npm run validate:data
```

The production build runs validation before building:

```bash
npm run build
```

## Current housekeeping state

The live entry point is:

```text
src/site.jsx
```

Earlier unused implementation files have been removed. The next phase should focus on formatting and presentation rather than further structural changes.

## Next improvements

Possible next improvements:

1. Improve visual hierarchy and page formatting.
2. Add print / export styling for senior papers.
3. Add a dependency matrix or network view if the Gantt becomes too dense.
4. Split `site.jsx` into smaller components if the interface continues to grow.
5. Add richer content editing guidance for non-technical users.
