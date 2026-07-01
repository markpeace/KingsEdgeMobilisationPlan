# Source Notes

This folder contains the first interactive site scaffold.

## Main files

- `main.jsx` mounts the React app.
- `App.jsx` contains the current routing and page components.
- `styles.css` contains the current visual system.
- `data/kings-edge-plan.json` is the single source of truth for the plan.

## Current routes

The app uses hash routing for static deployment:

- `#/`
- `#/deliverables`
- `#/deliverables/:id`
- `#/timeline`
- `#/dependencies`

## Data-driven rendering

The application should continue to render from JSON where possible. Avoid hard-coding plan text in React components unless it is part of the general interface.
