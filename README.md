# King's Edge Mobilisation Plan

This repository holds the interactive mobilisation site for the King's Edge programme.

The site helps users browse, understand and test the delivery plan for King's Edge. It makes the structure of the programme clear, shows how individual deliverables fit together, and makes step-level dependencies across the wider Education and Student Success portfolio visible.

## North star

We are building an interactive delivery map for King's Edge.

The site should help users understand how King's Edge turns the graduate premium into a deliverable programme of work: connecting curriculum-embedded value, co-curricular opportunity, extra-curricular belonging, and evidence and articulation of the King's graduate premium.

The plan is structured as a browsable hierarchy:

**King's Edge -> Projects -> Deliverables -> Components -> Delivery steps**

## Core user journeys

The site allows users to:

1. Browse the four King's Edge projects.
2. See the sixteen deliverables under those projects.
3. Click into any deliverable for a detailed page.
4. View delivery steps across a timeline / Gantt-style view.
5. See step-to-step dependencies across King's Edge and related projects.
6. View related projects that carry some core Edge requirements.
7. Filter deliverables by status and confidence.

## Terminology

- **King's Edge projects** are the four core projects: 2.1, 2.2, 2.3 and 2.4.
- **Related projects** are wider portfolio projects that carry Edge requirements, currently Education Cultures and Innovation, Curriculum Framework and Review, and the Single Student App / Digital Portal.
- **Dependencies** are step-to-step relationships, not whole projects.

## Documentation

The current documentation is in `docs/`:

- [North Star](docs/01-north-star.md)
- [Information Architecture](docs/02-information-architecture.md)
- [Data Model](docs/03-data-model.md)
- [King's Edge Content Model](docs/04-kings-edge-content-model.md)
- [Timeline and Step-Level Dependencies](docs/05-timeline-and-dependencies.md)
- [Related Projects](docs/06-cross-programme-dependencies.md)
- [Build Plan](docs/07-build-plan.md)
- [Status and Confidence Layer](docs/13-status-confidence-layer.md)

## Technical approach

The site is a lightweight static React / Vite application.

The main active entry point is:

```text
src/site.jsx
```

The site renders from JSON data sources:

```text
src/data/kings-edge-plan.json
src/data/enabling-projects.json
src/data/step-dependencies.json
src/data/status.json
```

## Current status

The site is scaffolded and deployable through GitHub Pages. The next phase is visual formatting and content refinement.
