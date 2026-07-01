# Information Architecture

## Site map

The site should have five primary views.

## 1. Home / Overview

The overview page should show the full King's Edge architecture at a glance.

It should include:

- the programme purpose
- four project columns
- sixteen deliverable cards
- project owners
- deliverable leads
- short summaries
- links to detailed deliverable pages
- links to timeline and dependency views

The default visual should mirror the planning table: four project columns, each with four deliverables beneath it.

## 2. Deliverables Index

A searchable and filterable list of all deliverables.

Useful filters:

- project
- owner / lead
- timing
- dependency type
- theme, such as skills, experiential learning, digital, belonging, evidence

Each row or card should link to the detailed deliverable page.

## 3. Deliverable Detail Page

Each deliverable should have a detailed page.

The page should include:

- reference number
- title
- parent project
- project owner
- deliverable lead
- short summary
- problem solved
- what changes
- components
- delivery steps
- timing
- depends on
- feeds into
- related deliverables
- related cross-programme dependencies

## 4. Timeline / Gantt View

The timeline should show delivery steps across four time anchors:

- Now to Christmas 2026
- January to summer 2027
- 2027/28 to 2028/29
- 2029/30

The Gantt should show both timing and dependency.

The default view should be readable rather than over-dense. Dependency lines can be optional or shown on hover / selection.

## 5. Dependencies View

This view should explain the main dependencies and handoffs.

It should include:

- Education Cultures and Innovation
- Curriculum Framework and Review
- Single Student App / Digital Portal

It should also show how King's Edge deliverables depend on, feed into, or generate requirements for these wider projects.

## Navigation model

Users should be able to move in several directions:

- Home -> deliverable detail
- Deliverables index -> deliverable detail
- Timeline -> deliverable detail
- Deliverable detail -> related deliverables
- Deliverable detail -> dependency sidebar
- Dependency view -> affected deliverables

## Suggested route names

If using React Router or similar:

- `/` for overview
- `/deliverables` for the deliverables index
- `/deliverables/:id` for individual deliverable pages
- `/timeline` for Gantt view
- `/dependencies` for dependency view

## Key interaction principles

- The site should render from JSON, not from hard-coded content.
- Each deliverable should be addressable by URL.
- The Gantt should link back to deliverable pages.
- Dependencies should be visible without overwhelming the main view.
- The content should be easy to update as the plan evolves.
