# Deliverable governance model

## Principle

Governance should answer the questions that the rest of the deliverable page does not already answer.

The hero is the source of truth for:

- accountable owner;
- delivery lead.

Benefits are the source of truth for:

- benefit owner.

The Delivery timeline is the source of truth for:

- step decisions;
- step dependencies;
- resources;
- risks, issues and assumptions;
- operational ownership attached to a step or output.

The governance section should therefore focus on:

- where material decisions and escalations go;
- who will own the enduring service, process, evidence resource or capability after mobilisation;
- which partner groups are essential and what they contribute;
- a derived summary of benefit ownership.

## Canonical structure

```json
{
  "ownership": {
    "accountableOwner": "Named accountable owner",
    "deliveryLead": "Named delivery lead"
  },
  "governance": {
    "decisionForum": "Vice Deans Education or delegates",
    "decisionScope": "Material choices about scope, investment, faculty participation, enduring ownership and escalation.",
    "businessAsUsualOwner": "TBC",
    "businessAsUsualOwnershipNote": "The enduring owner will be confirmed through the business-as-usual transfer step.",
    "deliveryPartners": [
      {
        "group": "Evidence and data",
        "partners": [
          "Careers and Employability Service",
          "Planning and analytics colleagues"
        ],
        "contribution": "Provide, interpret and maintain the evidence and responsible-use guidance."
      }
    ]
  },
  "benefits": [
    {
      "id": "2.1.1-B1",
      "title": "Programmes can claim their graduate futures value with confidence",
      "owner": "Heads of Department"
    }
  ]
}
```

## Decision route

`decisionForum` names the forum or role with authority to resolve material choices and escalations.

`decisionScope` should explain what goes there. It should not reproduce the list of decisions already attached to individual steps.

Appropriate matters include:

- material scope changes;
- priority or sequencing choices that affect the whole route;
- unresolved investment decisions;
- participation or ownership decisions spanning several faculties or teams;
- business-as-usual ownership;
- escalations that cannot be resolved within a delivery step.

## Business-as-usual ownership

`businessAsUsualOwner` identifies who will sustain the capability after mobilisation.

Use `TBC` honestly when the ownership model is unresolved. Explain the route to resolution in `businessAsUsualOwnershipNote`.

Do not confuse business-as-usual ownership with the delivery lead. The delivery lead may mobilise the work without becoming its enduring operational owner.

## Benefit ownership

Put `owner` on each benefit. Different benefits may have different owners.

The owner is accountable for ensuring the benefit is realised, not simply for producing the timeline outputs that enable it.

Do not maintain a generic `ownership.benefitOwner` field for revised deliverables.

## Key delivery partners

Use `governance.deliveryPartners` for a small grouped list of essential partners and their contribution.

This is not a comprehensive stakeholder register. Avoid flat lists of everyone who may be consulted, informed or eventually use an output.

Good groupings might include:

- evidence and data;
- academic and faculty delivery;
- facilitation and enhancement;
- technology or systems;
- story activation or communications.

## Do not put in governance

- accountable owner or delivery lead, because these are already in the hero;
- planning maturity, because `planningStatus` is the canonical workflow;
- individual step decisions;
- step dependencies;
- resource asks;
- a comprehensive contributor or stakeholder list;
- delivery status reporting.

## UI

Use the reader-facing heading:

```text
How this is governed
```

The section should show:

1. benefit ownership;
2. decision and escalation route;
3. business-as-usual ownership;
4. key delivery partners.

Keep it compact and subordinate to the case for change, benefits and Delivery timeline.
