# Delivery status and confidence layer

The repository tracks plan maturity and operational delivery on separate axes.

## Planning stage

`planningStatus` describes how settled and authorised a deliverable plan is:

- `pre-draft`
- `proposition-draft` (Proposition draft)
- `draft` (Delivery draft)
- `validated-draft`
- `decision-ready`
- `mobilising`
- `in-delivery`

Planning stage belongs in the canonical deliverable JSON. It must not be inferred from delivery activity.

Proposition draft means the case for change and benefits are ready to test while delivery planning remains intentionally incomplete. Delivery draft means the wider delivery model has been mocked out. Validated draft means that delivery model has been tested with relevant owners, partners and evidence.

## Delivery status

Delivery status describes what is happening operationally. It is maintained separately in:

```text
src/data/status.json
```

The canonical delivery statuses are:

- `not-started`
- `in-progress`
- `blocked`
- `complete`

Legacy values `scoping` and `active` remain readable while old data is migrated, but new records should use the canonical values.

## Step-level source of truth

Author delivery status against step IDs. Do not maintain a second manually authored deliverable status.

```json
{
  "items": {
    "2.1.1-step-1": {
      "status": "in-progress",
      "asOf": "2026-07-15",
      "note": "Initial evidence-pack development is underway.",
      "decisionNeeded": false
    }
  }
}
```

A blocked step should identify the reason and, where useful, the blocking item:

```json
{
  "status": "blocked",
  "asOf": "2026-07-15",
  "note": "Waiting for workspace access.",
  "blockedBy": ["workspace-access"],
  "decisionNeeded": true
}
```

A completed step should include a completion date and short evidence note:

```json
{
  "status": "complete",
  "asOf": "2026-10-30",
  "completedAt": "2026-10-28",
  "completionNote": "Outputs were accepted and remaining actions transferred to the next step."
}
```

Do not use percentage completion unless a future delivery method provides a meaningful, consistently maintained calculation.

## Derived deliverable status

The app derives the operational summary for a deliverable from its steps:

- all steps not started: `not-started`
- any materially gating step blocked: `blocked`
- any step in progress, or a mixture of completed and remaining steps: `in-progress`
- all steps complete: `complete`

The timeline may display a summary such as `2 of 7 complete · 1 blocked`.

## Completion rule

A step becomes complete when its outputs or acceptance evidence have been achieved. The scheduled end of its period does not make it complete automatically.

Before marking a step complete, confirm that:

- intended outputs were produced;
- the relevant owner accepted them;
- unresolved actions were transferred explicitly;
- dependent work can proceed.

## Confidence

The existing confidence values remain available for content and status records:

- `settled`
- `needs-validation`
- `placeholder`

Confidence must not replace either `planningStatus` or delivery status. The timeline prioritises operational status and keeps plan maturity visible at deliverable level.

## Update discipline

During active delivery:

- the delivery lead or project manager updates status;
- status is reviewed weekly or fortnightly;
- every update includes an `asOf` date;
- every blocked status includes a reason and required action;
- every completed status includes a short completion record;
- stale status is treated as unknown rather than assumed current.

## Timeline presentation

The timeline keeps status and dependencies visually separate:

- status appears as text and an icon on each step;
- selection uses black;
- prerequisites use solid red;
- onward handoffs use a red outline;
- status is never communicated by colour alone.
