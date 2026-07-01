# Information Architecture

## Site map

The site currently has five primary views.

## 1. Home / Overview

The overview page shows the full King's Edge architecture at a glance.

It includes:

- the programme purpose
- four King's Edge project columns
- sixteen deliverable cards
- project owners
- deliverable leads
- short summaries
- status and confidence badges
- links to detailed deliverable pages
- links to timeline and related project views

The default visual mirrors the planning table: four project columns, each with four deliverables beneath it.

## 2. Deliverables Index

A searchable and filterable list of all Edge deliverables.

Current filters:

- project
- status
- confidence
- keyword search across title, owner, summary and tags

Each row links to the detailed deliverable page.

## 3. Deliverable Detail Page

Each deliverable has a detailed page.

The page includes:

- reference number
- title
- parent project
- project owner
- deliverable lead
- short summary
- status, confidence and decision flag
- problem solved
- what changes
- components
- delivery steps
- step-level dependencies
- onward step dependencies

## 4. Timeline / Gantt View

The timeline shows delivery steps across four time anchors:

- Now to Christmas 2026
- January to summer 2027
- 2027/28 to 2028/29
- 2029/30

The Gantt shows both timing and step-level dependency.

Users can click a step to see what it depends on and what it enables. The Gantt can include or hide related projects.

## 5. Related Projects View

This view explains the wider portfolio projects that carry some of the core requirements for Edge.

It currently includes:

- Education Cultures and Innovation
- Curriculum Framework and Review
- Single Student App / Digital Portal

These are not treated as dependencies in themselves. They are related delivery projects with their own steps. Dependencies are the step-to-step relationships between Edge work and these related projects.

## Navigation model

Users can move in several directions:

- Home -> deliverable detail
- Deliverables index -> deliverable detail
- Timeline -> deliverable detail
- Deliverable detail -> related steps
- Related projects -> served Edge deliverables
- Timeline -> related project steps

## Current route names

The app uses hash routes for static deployment:

- `#/` for overview
- `#/deliverables` for the deliverables index
- `#/deliverables/:id` for individual deliverable pages
- `#/timeline` for Gantt view
- `#/enabling-projects` for related projects

The old `#/dependencies` route is still accepted and resolves to the related projects view.

## Key interaction principles

- The site should render from JSON, not from hard-coded content.
- Each deliverable should be addressable by URL.
- The Gantt should link back to deliverable pages and related projects.
- Dependencies should be visible without overwhelming the main view.
- The status layer should distinguish settled work from provisional work.
- The content should be easy to update as the plan evolves.
