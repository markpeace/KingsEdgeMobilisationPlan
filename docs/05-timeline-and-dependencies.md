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

## Time buckets

The current timeline uses visible six-month buckets, starting at July to December 2026 and running to July to December 2030.

Each visible bucket is split internally into three equal sequencing thirds. The UI shows the bucket label across the three internal timeline columns; it does not show `a`, `b` or `c` to the reader.

| Bucket id | Label | Short label |
|---|---|---|
| `jul-dec-2026` | July to December 2026 | Jul-Dec 26 |
| `jan-jun-2027` | January to June 2027 | Jan-Jun 27 |
| `jul-dec-2027` | July to December 2027 | Jul-Dec 27 |
| `jan-jun-2028` | January to June 2028 | Jan-Jun 28 |
| `jul-dec-2028` | July to December 2028 | Jul-Dec 28 |
| `jan-jun-2029` | January to June 2029 | Jan-Jun 29 |
| `jul-dec-2029` | July to December 2029 | Jul-Dec 29 |
| `jan-jun-2030` | January to June 2030 | Jan-Jun 30 |
| `jul-dec-2030` | July to December 2030 | Jul-Dec 30 |

## Step period schema

A delivery step can use a whole bucket:

```json
{ "period": "jul-dec-2026" }
```

It can also use one or more thirds inside a bucket:

```json
{ "period": "jul-dec-2026:a" }
{ "period": "jul-dec-2026:ab" }
{ "period": "jul-dec-2026:abc" }
```

Allowed third selectors are:

| Selector | Meaning |
|---|---|
| `a` | first third of the bucket |
| `b` | middle third of the bucket |
| `c` | final third of the bucket |
| `ab` | first two thirds of the bucket |
| `bc` | final two thirds of the bucket |
| `abc` | the whole bucket |

For work that spans more than one bucket, use an object with explicit start and end points:

```json
{
  "period": {
    "start": "jan-jun-2027:b",
    "end": "jul-dec-2027:ab"
  }
}
```

## Related projects

The timeline can show King's Edge deliverables and the related projects that carry Edge requirements:

- Education Cultures and Innovation
- Curriculum Framework and Review
- Single Student App / Digital Portal

These related projects are also rows in the Gantt, so their steps can be linked to Edge delivery steps.

## Dependency behaviour

The Gantt should render:

- deliverables and related projects as rows
- six-month buckets as visible columns
- hidden thirds inside each bucket for sequencing
- delivery steps as blocks within the relevant period span
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
  "2.3.1-step-3": ["2.2.2-step-2", "single-app-step-2"]
}
```

## Recommended behaviour

The implementation should keep the Gantt readable:

- click a step to select it
- highlight prerequisite steps
- highlight dependent steps
- show a short dependency panel above the Gantt
- keep full dependency arrows out of the default view

A later version could add a network view or optional dependency lines if needed.
