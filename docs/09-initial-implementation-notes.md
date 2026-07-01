# Initial Implementation Notes

The first implementation has been scaffolded as a lightweight Vite / React site.

## Implemented views

- Overview page with four project columns and sixteen deliverables
- Deliverables index with search and project filter
- Deliverable detail pages driven by JSON
- Timeline / Gantt-style view with dependency markers
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

The timeline shows dependency markers on steps that depend on another item. Hovering over a step shows the relevant dependency detail in the browser tooltip.

The deliverable detail pages show:

- depends on
- feeds into
- step-level dependencies

Later versions could add optional dependency lines or a network view, but the first version keeps this deliberately restrained to avoid visual clutter.

## Next improvements

Possible next improvements:

1. Add richer Gantt interactions, including click-to-highlight dependencies.
2. Add a dependency matrix or network view.
3. Add editable status fields, such as not started, in progress, blocked or complete.
4. Add export or print styling for senior papers.
5. Add a GitHub Pages workflow for automatic deployment.
