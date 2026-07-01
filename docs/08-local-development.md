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

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Data source

The app renders from:

```text
src/data/kings-edge-plan.json
```

Update this file to change the plan content. The React interface should not need to be edited for ordinary plan updates.

## Routes

The site uses hash routes for simple static deployment:

- `#/` overview
- `#/deliverables` deliverables index
- `#/deliverables/2.2.1` deliverable detail page
- `#/timeline` timeline / Gantt view
- `#/dependencies` cross-programme dependencies
