# Local Development

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Then open the local URL printed by Vite.

## Validate data

```bash
npm run validate:data
```

## Build

```bash
npm run build
```

The build runs data validation before Vite builds the site.

## Preview production build

```bash
npm run preview
```

## Data sources

The app renders from:

```text
src/data/kings-edge-plan.json
src/data/enabling-projects.json
src/data/step-dependencies.json
src/data/status.json
```

Update these files to change the plan content, related project content, dependency logic or status layer. The React interface should not need to be edited for ordinary plan updates.

## Routes

The site uses hash routes for simple static deployment:

- `#/` overview
- `#/deliverables` deliverables index
- `#/deliverables/2.2.1` deliverable detail page
- `#/timeline` timeline / Gantt view
- `#/enabling-projects` related projects

The old `#/dependencies` route is still accepted and resolves to the related projects view.
