# Source Notes

This folder contains the current interactive site.

## Main files

- `site.jsx` is the active React entry point referenced by `index.html`.
- `styles.css` contains the main visual system.
- `status-utils.js` provides status and confidence helpers.
- `plan-utils.js` provides plan lookup and dependency helpers.
- `data/kings-edge-plan.json` holds the core King's Edge plan.
- `data/enabling-projects.json` holds the related wider portfolio projects.
- `data/step-dependencies.json` holds step-to-step dependency relationships.
- `data/status.json` holds status, confidence and decision flags.

## Current routes

The app uses hash routing for static deployment:

- `#/`
- `#/deliverables`
- `#/deliverables/:id`
- `#/timeline`
- `#/enabling-projects`

The legacy `#/dependencies` route is still accepted and redirects conceptually to the related projects view.

## Data-driven rendering

The application should continue to render from JSON where possible. Avoid hard-coding plan text in React components unless it is part of the general interface.
