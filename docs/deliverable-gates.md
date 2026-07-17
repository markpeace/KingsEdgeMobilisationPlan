# Deliverable development gates

Readiness is managed at deliverable level. Projects do not carry a readiness status.

`planningStatus` records where a deliverable is in the development and approval journey. It is not an operational progress measure. Once a deliverable is approved to mobilise, operational progress is recorded against its steps in `src/data/status.json`.

## Canonical stages

| `planningStatus` | Card label | Work under way | Gate to leave the stage |
| --- | --- | --- | --- |
| `proposition-development` | Proposition development | Clarify the need, intended change, strategic contribution, benefits, scope, intersections, assumptions and likely owner or lead. | The proposition is ready for informal stakeholder sense-check. |
| `proposition-review` | Proposition review | Sense-check the proposition with the owner, likely delivery lead, selected senior or key stakeholders, specialists and owners of important intersections. This is not formal governance. | Feedback supports moving into delivery design; material points are recorded in the log. |
| `delivery-design` | Delivery design | Define outputs, delivery steps, sequencing, dependencies, handoffs, benefit and measure links, and completion evidence without yet constraining the route by resource. | The delivery route is coherent enough to resource. |
| `resource-planning` | Resource planning | Define roles, skills, existing capacity, new investment, data or digital needs, enabling conditions, timing and the consequences of gaps. | The resource requirement is complete and explicit. |
| `plan-validation` | Plan validation | Test the route and resource requirement with the owner, delivery lead, operational partners, benefit owners, resource teams, dependency owners, business-as-usual owners and relevant specialists. | The plan is supported, material feedback is addressed and it is ready for Portfolio Board. |
| `portfolio-board-approval` | For Board approval | Ask the Portfolio Board to approve the proposition, benefits, route, resource requirement, risks, dependencies, consultation and stated conditions. | The Portfolio Board approves the deliverable, with conditions recorded where relevant. |
| `resource-confirmation` | Resource confirmation | Authorise capacity and investment, confirm named teams or roles, resolve enabling conditions and reconcile ambition with the resource actually available. | The plan is resource-backed, achievable and remains within the basis approved by the Board. |
| `approved-to-mobilise` | Approved to mobilise | The planning and approval journey is complete. | Operational tracking moves to the delivery steps. |

Portfolio Board approval and resource approval may happen at the same meeting, but they remain separate decisions and should be recorded separately. If resource confirmation requires a material change to the proposition, benefits or approved delivery basis, the deliverable returns to the Portfolio Board. Smaller changes may be agreed under delegated authority.

## Progressive disclosure

- Proposition development remains visible in the project map and deliverable detail page.
- Proposition review and later stages appear in the Deliverables index.
- Delivery design and later stages appear in Measures and Timeline because a proposed delivery route now exists.
- Before approval to mobilise, timeline steps are labelled indicative and do not show operational delivery status.
- Approved-to-mobilise deliverables keep that final deliverable label while `not-started`, `in-progress`, `blocked` and `complete` are tracked against steps.

## Decisions and consultation log

Every deliverable carries a `decisionLog` array. It may remain empty. It is a simple historical record, not a workflow engine and not a replacement for step-level decisions.

Add an entry when a material consultation or decision should remain visible to later readers. Do not log every conversation. Append entries in chronological order.

```json
{
  "decisionLog": [
    {
      "date": "2026-07-17",
      "type": "consultation",
      "forum": "Informal proposition sense-check",
      "seenBy": ["Accountable owner", "Likely delivery lead", "Selected reference group"],
      "outcome": "Proceed to delivery design with the stated points addressed.",
      "notes": "Optional context or conditions."
    }
  ]
}
```

Required fields are `date`, `type`, `forum` and `outcome`. `type` is either `consultation` or `decision`. `seenBy` and `notes` are optional. Recording an entry does not automatically change `planningStatus`.
