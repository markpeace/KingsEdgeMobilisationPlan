# Timeline and Step-Level Dependencies

## Timeline purpose

The timeline / Gantt view should show when work happens and how delivery steps interact across projects.

The important distinction is:

- Education Cultures and Innovation, Curriculum Framework and Review, and the Single Student App are related delivery projects, not dependencies in themselves.
- Dependencies are the step-to-step relationships between Edge deliverables and those related projects.

The timeline should answer three questions:

1. What starts now?
2. What comes later?
3. Which delivery steps need other delivery steps to land first?

## Time anchors

The first version uses four time anchors:

| Period id | Label | Short label |
|---|---|---|
| `now-xmas-2026` | Now to Christmas 2026 | Now-Xmas 26 |
| `jan-summer-2027` | January to summer 2027 | Jan-summer 27 |
| `ay-2027-28-to-2028-29` | 2027/28 to 2028/29 | 2027/28-2028/29 |
| `ay-2029-30` | 2029/30 | 2029/30 |

## Related projects

The timeline can show King's Edge deliverables and the related projects that carry Edge requirements:

- Education Cultures and Innovation
- Curriculum Framework and Review
- Single Student App / Digital Portal

These related projects are also rows in the Gantt, so their steps can be linked to Edge delivery steps.

## Dependency behaviour

The Gantt should render:

- deliverables and related projects as rows
- time anchors as columns
- delivery steps as blocks within the relevant period
- step-level dependency markers
- a dependency lens that shows what the selected step depends on and what it enables

## Data model

Step-level dependencies are held in:

```text
src/data/step-dependencies.json
```

This avoids treating whole projects as dependencies. Instead, the site can show that one specific step relies on another specific step.

Example:

```json
{
  "2.2.2-step-2": ["2.1.2-step-4"],
  "2.3.1-step-3": ["2.2.1-step-2", "single-app-step-2"]
}
```

## Recommended behaviour

The first implementation should keep the Gantt readable:

- click a step to select it
- highlight prerequisite steps
- highlight dependent steps
- show a short dependency panel above the Gantt
- keep full dependency arrows out of the default view

A later version could add a network view or optional dependency lines if needed.
