# Shared resource model

This repository supports coherent people and capability resources that contribute to more than one deliverable.

## Purpose

Step-level resource asks remain authoritative for delivery planning. A shared resource adds identity above those asks so several deliverables can point to the same underlying post, placement, project-management capacity or analytical capability without duplicating the underlying resource concept.

## Registry

Shared resources are defined once in:

`src/data/shared-resources.json`

Each resource should use a stable `id` and may carry descriptive metadata such as title, summary, resource type, total FTE or capacity, appointment basis, funding basis and BAU destination.

The registry is deliberately separate from deliverable JSON because the resource may span projects and deliverables.

## Linking a step resource ask

Any item in `existingCapacity` or `newInvestment` may optionally include:

```json
{
  "sharedResourceId": "edge-example-resource",
  "sharedResourceAllocation": {
    "fte": 0.25,
    "note": "Quarter of the coherent post is planned against this deliverable."
  }
}
```

`sharedResourceId` links the ask to the coherent resource. `sharedResourceAllocation` records the planned contribution of that deliverable or step to the shared total. Allocation metadata is optional because some shared resources are cash or capability rather than FTE-led.

Do not infer shared identity from matching role names. Use the stable ID.

## Counting rule

The ordinary resource profile continues to derive demand from step asks exactly as before. Shared-resource aggregation is a second view over those same asks.

A shared resource should be counted once as a coherent resource in the registry, while its linked allocations explain where that resource is consumed. Do not repeat the full underlying cost on every linked deliverable. Record the financial ask once at the step where funding is first required, then use linked existing-capacity asks or zero-cash allocation records elsewhere as appropriate.

## BAU

A shared resource can still use the existing `bauLiability: true` mechanism on the authoritative new-investment ask. The registry may additionally describe the intended BAU destination so readers can distinguish mobilisation funding from the enduring organisational liability.

## Current status

The registry is scaffolded but intentionally empty. Programme-specific resources should be added only when the relevant delivery plans are ready for resource authoring.
