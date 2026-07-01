# Build Plan

## Aim

Build and maintain a lightweight interactive site that renders the King's Edge mobilisation plan from JSON.

The first version prioritises clarity, speed and ease of iteration. The next phase is visual polish and content refinement.

## Current stack

- Vite
- React
- Simple CSS
- JSON data sources committed in the repository
- GitHub Pages deployment

## Current build scope

The current build includes:

1. Overview page with four King's Edge project columns and sixteen deliverables.
2. Deliverables index with search, project, status and confidence filters.
3. Deliverable detail pages.
4. Timeline / Gantt view using four broad time anchors.
5. Related projects shown as timeline rows.
6. Step-level dependency highlighting.
7. Status and confidence layer.
8. Related projects view for Education Cultures, Curriculum Framework and Review, and Single Student App.
9. JSON validation before build.

## Current file structure

```text
src/
  site.jsx
  plan-utils.js
  status-utils.js
  styles.css
  data/
    kings-edge-plan.json
    enabling-projects.json
    step-dependencies.json
    status.json

public/
  status.css

docs/
  01-north-star.md
  02-information-architecture.md
  03-data-model.md
  04-kings-edge-content-model.md
  05-timeline-and-dependencies.md
  06-cross-programme-dependencies.md
  07-build-plan.md
  13-status-confidence-layer.md
```

The active app entry is `src/site.jsx`, referenced directly from `index.html`.

## Current build process

Install dependencies:

```bash
npm install
```

Validate data:

```bash
npm run validate:data
```

Build:

```bash
npm run build
```

The build command runs data validation before Vite builds the site.

## Design principles

- Keep the main overview calm and readable.
- Put depth on detail pages, not in the main grid.
- Use clear hierarchy: project, deliverable, step.
- Make ownership visible.
- Treat related projects as projects, not as dependencies.
- Use dependencies only for step-to-step relationships.
- Make dependencies visible but not visually noisy.
- Use the status layer to distinguish settled work from provisional work.
- Treat the timeline as a strategic sequencing tool, not a detailed project management Gantt.

## Next development task

Move into visual formatting and senior-view polish:

- improve homepage hierarchy
- improve Gantt readability
- refine card spacing and typography
- make the related projects treatment clearer
- improve print or meeting-readiness if needed
