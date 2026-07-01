# Timeline and Dependencies

## Timeline purpose

The timeline / Gantt view should show when work happens and what it depends on.

It should answer three questions:

1. What starts now?
2. What comes later?
3. What needs something else to happen first?

## Time anchors

The first version should use four time anchors:

| Period id | Label | Short label |
|---|---|---|
| `now-xmas-2026` | Now to Christmas 2026 | Now-Xmas 26 |
| `jan-summer-2027` | January to summer 2027 | Jan-summer 27 |
| `ay-2027-28-to-2028-29` | 2027/28 to 2028/29 | 2027/28-2028/29 |
| `ay-2029-30` | 2029/30 | 2029/30 |

These periods are deliberately broad. The plan is not yet a detailed Gantt chart with week-by-week milestones.

## Gantt behaviour

The Gantt should render:

- deliverables as rows
- time anchors as columns
- delivery steps as bars or blocks within the relevant period
- dependency markers where a step or deliverable depends on another item

## Dependency visibility

Dependencies need to be visible without making the Gantt unreadable.

Recommended behaviour for version one:

- show a small dependency icon on a bar or row where dependencies exist
- show dependency detail on hover or click
- link from the dependency popover to the related deliverable
- provide a toggle to show dependency lines later, if needed

## Dependency types

The site should distinguish different kinds of dependency.

| Type | Meaning |
|---|---|
| Input | Needs an output from another deliverable before it can progress properly |
| Handoff | Produces requirements for another project, system or programme |
| Alignment | Needs to remain consistent with another strand, but can progress in parallel |
| Enabler | Provides infrastructure others will use |
| Evidence feed | Provides data, insight or stories into another deliverable |

## Example dependency logic

### 2.1.2 Experiential Learning North Star and Future Student Entitlement

Feeds into:

- 2.1.4 Curriculum-Embedded Opportunity Growth and Assurance
- 2.2.2 Experiential Opportunity Operating Model and Partnership Infrastructure
- 2.2.4 Flexible Adjunct Experiential and Thematic Opportunities
- Curriculum Framework audit requirements

### 2.2.1 King's Canvas

Depends on:

- 2.1.3 Standard Skills Classification and Future Skills Mapping Model
- Single Student App / Digital Portal for implementation

Feeds into:

- 2.3.1 Digital Portal for Opportunity Navigation
- 2.4.3 Student Evidence, Recognition and Articulation
- demand-led commissioning in 2.2.4

### 2.3.1 Digital Portal for Opportunity Navigation

Depends on:

- existing Eventbrite-like opportunity platform
- 2.2 opportunity taxonomy and opportunity data requirements
- 2.2.1 King's Canvas logic
- 2.1.3 skills architecture

Feeds into:

- student-facing opportunity navigation
- evidence capture
- recognition and microcredential visibility
- enhanced student record requirements

## External dependency lanes

The Gantt should include, or at least reference, three external dependency lanes:

1. Education Cultures and Innovation
2. Curriculum Framework and Review
3. Single Student App / Digital Portal

These are not King's Edge deliverables, but they fulfil core Edge needs.

## Recommended first implementation

For the first build, do not try to draw complex dependency arrows by default.

Start with:

- a deliverable-row Gantt
- timeline periods across the top
- step blocks in each period
- dependency badges
- click / hover dependency panels
- links back to detail pages

This will be clearer than a visually dense network diagram.
