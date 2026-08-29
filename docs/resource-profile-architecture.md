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

This means the same component can represent cash-led commissioning, existing-capacity models, funded FTE, permanent workforce establishment, temporary placements and recurrent BAU operating budgets without deliverable-specific rendering code.

## Regression coverage

Resource integration tests exercise materially different source models including 1.4.2, 2.2.4 and 4.1.3. A resource-bearing deliverable must be eligible for the shared panel regardless of whether it has a governance part or workforce model.
