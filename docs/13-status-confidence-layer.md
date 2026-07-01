# Status and Confidence Layer

The site now includes a lightweight status and confidence layer.

## Purpose

The status layer helps distinguish between parts of the plan that are:

- already active
- being scoped
- not yet started
- blocked
- complete

The confidence layer helps distinguish between content that is:

- settled
- needing validation
- still a placeholder

This matters because the site can otherwise make an immature plan look more settled than it is.

## Data source

Status data is held separately from the main plan content:

```text
src/data/status.json
```

This keeps the core plan structure clean while allowing status to change regularly.

## Data model

Each item can have:

```json
{
  "status": "scoping",
  "confidence": "needs-validation",
  "decisionNeeded": true,
  "note": "Short explanation of what needs attention."
}
```

## Supported statuses

- `not-started`
- `scoping`
- `active`
- `blocked`
- `complete`

## Supported confidence levels

- `settled`
- `needs-validation`
- `placeholder`

## Where status appears

Status and confidence are rendered on:

- overview deliverable cards
- deliverables index
- deliverable detail pages
- delivery step cards
- related project cards
- timeline rows and selected timeline steps

## Recommended use

Use the status layer to prepare senior conversations.

Good questions to ask from this layer:

- Which items are active now?
- Which items are only scoped?
- Which items need a decision?
- Which items are placeholders and should not yet be treated as settled?
- Which related projects are blocking or enabling Edge delivery?
