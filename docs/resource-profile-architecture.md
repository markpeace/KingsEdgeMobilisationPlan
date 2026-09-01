# Resource and investment profile architecture

The Resource and Investment profile is a shared React component rendered by the main application tree.

## Component contract

`ResourceInvestmentProfile` receives a page context:

- `{ type: 'deliverable', item: deliverable }`
- `{ type: 'project', item: project }`

`resource-profile-context.js` derives normalised delivery steps from that context and also checks whether the context has an agreed allocation from a coherent shared resource. The panel can therefore appear for a deliverable whose workforce allocation is known before its detailed delivery steps are sufficiently mature for step-level resource authoring.

The component must not depend on a governance section, DOM query, mutation observer, URL watcher or separate React root to appear.

## Authoritative data

For deliverable-local demand, step-level resource asks remain authoritative. The shared profile derives its ordinary resource and financial view from:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`
- recurrent asks marked `bauLiability: true`
- optional deliverable `workforceModel` metadata for appointment basis and BAU destination

For genuinely cross-deliverable workforce, `src/data/shared-resources.json` is the coherent source of truth for total FTE, academic-year cost, appointment basis, employment home, allocation plan and BAU destination. Individual delivery steps can link to that resource as their design matures.

This allows the same component to represent cash-led commissioning, existing-capacity models, funded FTE, permanent workforce establishment, temporary placements, recurrent BAU operating budgets and cross-deliverable workforce allocations without deliverable-specific rendering code.

## Shared resources

Shared resources solve a different problem from ordinary step asks. A step ask answers what a particular piece of delivery needs. A shared resource answers whether several pieces of delivery are drawing on the same underlying post or capability.

The coherent resource is defined once in `src/data/shared-resources.json`. It can contain a `yearlyProfile` and an `allocationPlan` by deliverable. Individual `existingCapacity` or `newInvestment` asks may additionally carry:

- `sharedResourceId`: the stable ID of the coherent resource;
- `sharedResourceAllocation.fte`: the portion of the coherent resource allocated to that step, where FTE is relevant;
- `sharedResourceAllocation.note`: optional authoring context.

Identity must never be inferred from matching role titles.

`resource-profile-context.js` combines the programme allocation plan with any linked step asks for the current deliverable or project and adds a shared-resource summary to the existing workforce-model callout. This preserves one Resource & Investment presentation path.

Where a page has only a planned shared-workforce allocation and no detailed step resource asks, the profile deliberately does not fabricate local cash totals, peak-team metrics or BAU totals. It shows the allocation and coherent resource profile, with a note that detailed step-level asks will follow delivery design.

## Counting and reconciliation

The full cost of a cross-deliverable workforce resource is held once in the shared-resource registry. Its `allocationPlan` distributes capacity rather than duplicating salary across consuming deliverables.

When an earlier local workforce assumption has been superseded by a coherent shared-resource decision, `src/data/shared-resource-reconciliations.json` records the replacement. Normal plan loading omits those superseded asks, so historical resource assumptions do not inflate current totals or remain visible as competing current asks.

The reconciliation file can also identify local funding that counts within a shared envelope. This is used for the confirmed 2.1.1 summer internship, which forms part of the Year 1 analytics envelope.

See `docs/shared-resource-model.md` for authoring guidance.

## Validation

`scripts/validate-shared-resources.mjs` checks that:

- shared resource IDs are unique;
- linked asks reference a registered resource;
- coherent and allocated FTE values are non-negative;
- allocation-plan deliverable IDs exist;
- each academic year's deliverable allocations reconcile to the coherent resource FTE;
- `totalFte` matches the peak annual FTE;
- malformed allocation or BAU objects fail validation.

The validator runs as part of `validate:data`, and shared-resource aggregation tests run as part of `test:resources`.

## Regression coverage

Resource integration tests exercise materially different source models including 1.4.2, 2.2.4 and 4.1.3. A resource-bearing deliverable must be eligible for the shared panel regardless of whether it has a governance part or workforce model.

Shared-resource tests additionally verify that stable IDs, rather than role text, drive cross-deliverable grouping and that planned FTE allocations aggregate by academic year.
