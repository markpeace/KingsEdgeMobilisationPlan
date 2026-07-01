# King's Edge Mobilisation Plan

This repository will hold the interactive mobilisation site for the King's Edge programme.

The site is intended to help users browse, understand and test the delivery plan for King's Edge. It should make the structure of the programme clear, show how individual deliverables fit together, and make dependencies across the wider Education and Student Success portfolio visible.

## North star

We are building an interactive delivery map for King's Edge.

The site should help users understand how King's Edge turns the graduate premium into a deliverable programme of work: connecting curriculum-embedded value, co-curricular opportunity, extra-curricular belonging, and evidence and articulation of the King's graduate premium.

The plan should be structured as a browsable hierarchy:

**King's Edge -> Projects -> Deliverables -> Components -> Delivery steps**

## Core user journeys

The site should allow users to:

1. Browse the four King's Edge projects.
2. See the sixteen deliverables under those projects.
3. Click into any deliverable for a detailed page.
4. View delivery steps across a timeline / Gantt-style view.
5. Understand dependencies between deliverables and wider strategic projects.
6. See where King's Edge relies on Education Cultures, Curriculum Framework and Review, and the Single Student App.

## Documentation

The current documentation is in `docs/`:

- [North Star](docs/01-north-star.md)
- [Information Architecture](docs/02-information-architecture.md)
- [Data Model](docs/03-data-model.md)
- [King's Edge Content Model](docs/04-kings-edge-content-model.md)
- [Timeline and Dependencies](docs/05-timeline-and-dependencies.md)
- [Cross-Programme Dependencies](docs/06-cross-programme-dependencies.md)
- [Build Plan](docs/07-build-plan.md)

## Proposed technical approach

The first version should be a lightweight static site, probably using React and Vite, with a JSON data source as the single source of truth.

The JSON should hold projects, deliverables, owners, summaries, components, delivery steps, dependencies and related deliverables. The interface should render from that data rather than hard-coding the plan into pages.

## Current status

This repository has been initialised with documentation only. The next step is to scaffold the site and add the first JSON data file.
