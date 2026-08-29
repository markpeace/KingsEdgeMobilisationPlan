# Optional deliverable workstreams

Workstreams are an optional organising layer inside a deliverable. They are useful where a deliverable contains meaningful parallel strands that persist across several chronological delivery steps.

They are not required. A deliverable with no workstreams continues to use the existing deliverable → steps → outputs model unchanged.

## Purpose

The repository uses two different dimensions for complex delivery:

- **workstreams** answer “which parallel strand of the deliverable is this part of?”;
- **steps** answer “what happens when, and what depends on what?”.

Workstreams do not create a second timeline. The Delivery timeline remains the source of truth for sequencing, dependencies and operational progress.

## When to use workstreams

Use workstreams only when they materially improve understanding. A useful workstream will normally meet more than one of these tests:

- it has recognisable ownership;
- it persists across more than one delivery step or period;
- it runs in parallel with another strand;
- it carries a meaningful share of delivery responsibility or portfolio contribution;
- stakeholders need to understand or discuss it separately from the overall deliverable.

Do not use a workstream as another name for a task, output, component, team or phase.

## Data model

A deliverable may optionally include:

```json
{
  "workstreams": [
    {
      "id": "2.2.4-ws-career",
      "title": "Final-Year Career Enhancement",
      "owner": "Careers and Employability Service",
      "summary": "A parallel strand contributing to the overall deliverable.",
      "stepIds": ["2.2.4-step-1", "2.2.4-step-2"]
    }
  ]
}
```

Required fields for each workstream are `id`, `title` and `summary`. `owner` and `stepIds` are optional. When `stepIds` are present, they must reference steps inside the same deliverable.

`stepIds` deliberately point from the organising workstream to the canonical delivery steps. This avoids duplicating or nesting the timeline and allows a step to participate in several workstreams.

## Deliberate limits

Workstreams do **not** have their own:

- planning status;
- operational delivery status;
- dependency graph;
- resources or investment model;
- risks, issues or assumptions;
- governance route;
- nested steps or timeline.

Those remain attached to the deliverable or its canonical delivery steps. If a proposed workstream needs its own approval journey, independent delivery plan or substantial governance, it is probably a deliverable rather than a workstream.

## Prototype cases

The initial repository-wide test uses three deliberately different deliverables:

- `2.2.4` tests annually commissioned thematic workpackages that are important in Year 1 but are not the deliverable timeline;
- `4.1.2` tests several technical, discovery and experience strands running concurrently across a shared product roadmap;
- `1.4.2` tests persistent operating, commissioning, community and evidence strands across a long multi-year mobilisation.

The facility should be retained only if the same lightweight model makes all three easier to understand without making simpler deliverables more complicated.
