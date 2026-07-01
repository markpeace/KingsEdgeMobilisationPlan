# Initial Implementation Notes

The first implementation has been scaffolded as a lightweight Vite / React site.

## Implemented views

- Overview page with four project columns and sixteen deliverables
- Deliverables index with search and project filter
- Deliverable detail pages driven by JSON
- Timeline / Gantt-style view with dependency markers and dependency highlighting
- Cross-programme dependencies page

## Implemented data source

The plan is held in:

```text
src/data/kings-edge-plan.json
```

The data includes:

- programme metadata
- timeline periods
- four projects
- sixteen deliverables
- components
- delivery steps
- dependencies
- feeds into relationships
- related deliverables
- cross-programme dependencies

## Current dependency treatment

The timeline now includes a dependency lens.

Users can click a timeline step to show:

- the selected step
- what it depends on
- what it feeds into
- highlighted dependency and dependent blocks in the Gantt

The timeline also includes filters for:

- project
- major cross-programme dependency

The deliverable detail pages show:

- depends on
- feeds into
- step-level dependencies

Later versions could still add optional dependency lines or a network view, but the current version keeps the main Gantt readable.

## Data validation

A lightweight validation script has been added:

```bash
npm run validate:data
```

The production build now runs validation before building:

```bash
npm run build
```

## Next improvements

Possible next improvements:

1. Add status fields, such as not started, scoping, active, blocked or complete.
2. Add a dependency matrix or network view.
3. Add print / export styling for senior papers.
4. Split React components into separate files as the interface grows.
5. Add richer content editing guidance for non-technical users.
