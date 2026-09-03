# Shared resource model

This repository supports coherent people and capability resources that contribute to more than one deliverable.

## Purpose

Most resource demand remains authored on the delivery step that needs it. Shared workforce is the deliberate exception where no single deliverable truthfully owns the whole post or capability.

A shared resource adds stable identity above individual delivery asks so several deliverables can consume parts of one underlying post, placement cohort, project-management capacity or analytical capability without turning that resource into unrelated fractional jobs or duplicating its cost.

## Registry

Shared resources are defined once in:

`src/data/shared-resources.json`

Each resource uses a stable `id` and may carry:

- title and summary;
- resource type;
- peak coherent FTE;
- appointment basis and employment home;
- mobilisation funding basis;
- an academic-year `yearlyProfile` for coherent FTE and cost;
- an `allocationPlan` showing the intended FTE contribution to each deliverable by academic year;
- a BAU destination and recurrent liability where the mobilisation creates one.

The registry is separate from deliverable JSON because these resources span projects and deliverables.

## Planned allocation before detailed delivery design

Some deliverables reach resource planning before all of their delivery steps are sufficiently mature to carry a defensible step-level allocation. Do not invent delivery steps simply to park a workforce fraction.

In that situation, record the agreed distribution in the shared resource `allocationPlan`. This is the portfolio reconciliation target. The validator requires the deliverable allocations in each academic year to add back to the coherent FTE for that year.

As delivery design matures, the relevant step asks can reference the same shared resource. The step allocation describes where the work is actually consumed; the registry continues to define the coherent resource, its total cost and the portfolio-level reconciliation.

### Deferred deliverables and released capacity

When a deliverable is deliberately deferred, funded shared capacity should not remain parked against work that is no longer in the active investment view. Reallocate that capacity transparently to active work where there is a credible demand for it, without increasing the coherent resource envelope.

Deliverable **2.3.3 Subject Societies and Student-Led Discipline Communities is currently deferred**. Its former 0.10 FTE share of the Deputy Director, Enrichment & Enhancement and 0.05 / 0.10 / 0.10 FTE share of Project Officer capacity have therefore been redeployed to **2.3.4 Rhythms of the Wider King’s Experience**, which carries the active cross-institutional coordination and student-journey orchestration work. This is a reallocation of already-funded capacity, not additional investment. If 2.3.3 is reactivated, the shared-resource plan must be rebalanced explicitly rather than silently over-allocating the coherent posts.

## Linking a step resource ask

Any item in `existingCapacity` or `newInvestment` may optionally include:

```json
{
  "sharedResourceId": "edge-example-resource",
  "sharedResourceAllocation": {
    "fte": 0.25,
    "note": "Quarter of the coherent post is consumed by this delivery activity."
  }
}
```

`sharedResourceId` links the ask to the coherent resource. `sharedResourceAllocation` records the contribution of that step where a step-level allocation is useful. Do not infer shared identity from matching role names.

## Counting and costing rule

For deliverable-local resources, step-level asks remain the financial and delivery truth.

For a genuinely cross-deliverable shared workforce resource, the coherent FTE and cost are recorded once in the programme registry. The `allocationPlan` distributes capacity, not duplicate salary. Do not repeat the full cost, or a pro-rata salary cost, in every consuming deliverable merely to make local totals add up.

This means a deliverable resource profile can legitimately show that it consumes, for example, 0.15 FTE of a 1.0 FTE shared role while the coherent resource profile shows the single cost envelope once.

Where a pre-existing local ask has been replaced by a later coherent shared-resource decision, record the transition in:

`src/data/shared-resource-reconciliations.json`

Superseded local asks are omitted during normal plan loading so they cannot continue to inflate the current resource profile. The underlying authored delivery file remains intact as an auditable record of the earlier assumption.

A local amount can also be recorded as a `fundingContribution` when it forms part of, rather than sits on top of, a coherent shared envelope. The current example is the confirmed £4,000 six-week 2.1.1 internship, which counts within the £21,000 Year 1 analytics envelope.

## BAU

The registry can carry a `bauLiability` where a shared workforce resource creates an enduring organisational commitment. Time-limited placements and mobilisation-only capacity should state explicitly that there is no automatic BAU continuation.

## Current King's Edge shared workforce

The current registry contains five coherent resources:

1. Deputy Director, Enrichment & Enhancement, 1.0 FTE, permanent, mobilisation-funded from January 2027 and then a recurrent BAU liability.
2. King's Edge Analytics & Data Capability, 0.6 FTE-equivalent King's Talent capacity in Year 1 followed by one sandwich-year placement in each of Years 2 and 3.
3. King's Edge Project Officer Capacity, 1.0 FTE-equivalent King's Talent pool in Year 1 followed by two sandwich-year Project Officers in each of Years 2 and 3, hosted by the Transformation Office.
4. King's Edge Programme / Project Management, 0.5 FTE Transformation Office capacity across all three mobilisation years.
5. Experiential Learning Curriculum and Policy Development Capacity, 0.6 FTE-equivalent in Year 1 and 0.8 FTE in Years 2 and 3, mobilisation-funded at £40,000 / £55,000 / £55,000 across 2.1.2, 2.1.4 and 2.2.3, with no automatic BAU continuation.

The allocation plan is a planning baseline and should be rebalanced when detailed delivery evidence shows that workload lands differently, while always reconciling to the coherent resource total.
