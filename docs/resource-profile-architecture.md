# Resource and investment profile architecture

The Resource and Investment profile is a shared React component rendered by the main application tree.

## Component contract

`ResourceInvestmentProfile` receives a page context:

- `{ type: 'deliverable', item: deliverable }`
- `{ type: 'project', item: project }`

`resource-profile-context.js` derives normalised delivery steps from that context and determines whether any step carries resource asks. If there are no authored resource asks, the component returns no panel.

The component must not depend on a governance section, DOM query, mutation observer, URL watcher or separate React root to appear.

## Authoritative data

Step-level resource asks remain authoritative. The shared profile derives a decision-ready view from:

- `existingCapacity`
- `newInvestment`
- `enablingConditions`
- recurrent asks marked `bauLiability: true`
- optional deliverable `workforceModel` metadata for appointment basis and BAU destination
- optional shared-resource links where one coherent post or capability contributes to more than one deliverable

This means the same component can represent cash-led commissioning, existing-capacity models, funded FTE, permanent workforce establishment, temporary placements, recurrent BAU operating budgets and cross-deliverable workforce allocations without deliverable-specific rendering code.

## Shared resources

Shared resources solve a different problem from ordinary step asks. A step ask answers what a particular piece of delivery needs. A shared resource answers whether several of those asks are drawing on the same underlying post or capability.

The coherent resource is defined once in `src/data/shared-resources.json`. Individual `existingCapacity` or `newInvestment` asks may then carry:

- `sharedResourceId`: the stable ID of the coherent resource;
- `sharedResourceAllocation.fte`: the portion of the coherent resource allocated to that ask, where FTE is relevant;
- `sharedResourceAllocation.note`: optional authoring context.

Identity must never be inferred from matching role titles.

`resource-profile-context.js` aggregates linked asks for the current deliverable or project and adds a shared-resource summary to the existing workforce-model callout. This preserves one Resource & Investment presentation path. It does not create a second panel, separate React root or parallel financial model.

The coherent total and its appointment, funding or BAU destination belong in the shared-resource registry. The linked asks explain where that capacity is consumed. Financial investment must still be recorded once at the authoritative step that first requires funding, rather than repeated across every linked deliverable.

See `docs/shared-resource-model.md` for authoring guidance.

## Validation

`scripts/validate-shared-resources.mjs` checks that:

- shared resource IDs are unique;
- linked asks reference a registered resource;
- total and allocated FTE values are non-negative;
- malformed allocation objects fail validation.

The validator runs as part of `validate:data`, and shared-resource aggregation tests run as part of `test:resources`.

## Regression coverage

Resource integration tests exercise materially different source models including 1.4.2, 2.2.4 and 4.1.3. A resource-bearing deliverable must be eligible for the shared panel regardless of whether it has a governance part or workforce model.

Shared-resource tests additionally verify that stable IDs, rather than role text, drive cross-deliverable grouping and that FTE allocations aggregate against the coherent resource total.
