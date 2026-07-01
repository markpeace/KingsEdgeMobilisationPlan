# Build Plan

## Aim

Build a lightweight interactive site that renders the King's Edge mobilisation plan from JSON.

The first version should prioritise clarity, speed and ease of iteration. It should not over-engineer the interface.

## Recommended stack

Given the repository is currently empty, the recommended stack is:

- Vite
- React
- TypeScript optional, but recommended
- CSS modules or simple global CSS
- JSON data source committed in the repository

This should be straightforward to deploy using GitHub Pages, Netlify or Vercel.

## First build scope

The first build should include:

1. Overview page with four project columns and sixteen deliverables.
2. Deliverable detail pages.
3. Timeline / Gantt view using the four broad time anchors.
4. Dependency cards and dependency badges.
5. Cross-programme dependency view for Education Cultures, Curriculum Framework and Review, and Single Student App.
6. JSON data source for the plan.

## Suggested file structure

```text
src/
  App.tsx
  main.tsx
  components/
    ProjectColumn.tsx
    DeliverableCard.tsx
    DeliverableDetail.tsx
    TimelineView.tsx
    DependencyBadge.tsx
    DependencyPanel.tsx
    SidebarDependencyCard.tsx
  data/
    kings-edge-plan.json
  styles/
    global.css

docs/
  01-north-star.md
  02-information-architecture.md
  03-data-model.md
  04-kings-edge-content-model.md
  05-timeline-and-dependencies.md
  06-cross-programme-dependencies.md
  07-build-plan.md
```

If keeping data outside `src`, use `public/data/kings-edge-plan.json` instead.

## Build order

### Step 1: Scaffold the site

Create the Vite app, routing and base layout.

### Step 2: Add the JSON plan

Create the initial `kings-edge-plan.json` with:

- programme metadata
- four projects
- sixteen deliverables
- timeline periods
- cross-programme dependencies

### Step 3: Build overview page

Render four project columns. Each column shows project title, owner, summary and four deliverable cards.

### Step 4: Build deliverable detail pages

Each deliverable card links to a detail page showing full content.

### Step 5: Build timeline / Gantt view

Render deliverables as rows and time periods as columns. Show delivery steps in the relevant period. Include dependency badges.

### Step 6: Build dependencies view

Create dedicated cards for the three cross-programme dependencies, with links to affected deliverables.

### Step 7: Polish

Add:

- search / filter if useful
- responsive layout
- visual hierarchy
- simple tagging
- print-friendly or export-friendly styling if needed

## Design principles

- Keep the main overview calm and readable.
- Put depth on detail pages, not in the main grid.
- Use clear hierarchy: project, deliverable, step.
- Make ownership visible.
- Make dependencies visible but not visually noisy.
- Treat the timeline as a strategic sequencing tool, not a fully detailed project management Gantt.

## Immediate next development task

Create the first JSON data file and scaffold the React/Vite site.
