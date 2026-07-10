# Value and evidence model

## Principle

The deliverable page separates delivery from value.

The Delivery timeline is the source of truth for delivery. It owns steps, timing, products, outputs, dependencies, resources, decisions, risks, assumptions and step-level completion evidence.

The Value and evidence section explains the value the deliverable is expected to create and how we will know that value is being realised. It should not create a second hidden delivery plan.

Use this logic:

```text
Benefit -> what success looks like -> evidence of success -> enabled by timeline outputs
```

Measures should be benefit-led:

```text
Benefit -> what success looks like -> evidence of success -> measure / indicator -> enabled by timeline outputs
```

## Delivery timeline owns

- steps;
- products and outputs;
- timing;
- dependencies and handoffs;
- resources;
- decisions;
- risks, issues and assumptions;
- step-level completion evidence or definition of done where relevant.

## Value and evidence owns

- benefits;
- beneficiaries;
- what success looks like;
- evidence of success or measures;
- realisation period;
- references back to existing step outputs, products or step IDs.

## Authoring rule

Do not create new products or outputs in the value section.

Products and outputs belong in the timeline. If a benefit needs to mention a product, output or pack, author that product or output on the relevant delivery step, then reference it from the benefit through `enabledBy` or `linkedOutputs`.

A benefit should describe value realised through use, not the thing being produced.

## Benefit shape

Recommended fields:

```json
{
  "id": "2.1.1-B1",
  "title": "Programmes can tell a stronger graduate futures story",
  "statement": "Programme teams have clearer evidence and language for explaining what their programme enables for students and how that value shows up in graduate futures.",
  "beneficiary": "Programme teams, departments, students, applicants, recruitment teams and faculties",
  "benefitType": "articulation and evidence",
  "realisationPeriod": "2026/27 onwards",
  "successLooksLike": "Programme teams can make confident, nuanced and evidence-informed claims about what their programmes enable.",
  "evidenceOfSuccess": [
    "Programme stories are used in programme review, recruitment, open days or student-facing contexts.",
    "Claims are linked to evidence and agreed with relevant programme teams."
  ],
  "measures": [
    {
      "id": "2.1.1-B1-M1",
      "title": "Use of programme story material",
      "measureType": "usage and qualitative evidence",
      "questionAnswered": "Are programme stories being used in meaningful contexts?",
      "measure": "Examples of use in review, open days, recruitment or student-facing material."
    }
  ],
  "enabledBy": [
    {
      "stepId": "2.1.1-step-1",
      "outputTitle": "First working graduate futures evidence pack"
    }
  ]
}
```

Use `outputId` when the step output has a stable ID. Use `outputTitle` when the step output is currently title-only.

## Measures and indicators

Default to benefit-level measures when a measure tests one specific benefit. This keeps the logic clear:

```text
this is the benefit -> this is what success looks like -> this is how we will know
```

Use top-level deliverable `measures` only when the measure is cross-cutting, legacy, or genuinely supports more than one benefit. In that case, add `supportsBenefits` so the relationship is explicit.

```json
{
  "id": "2.1.1-M6",
  "title": "Programme story and responsible interpretation quality",
  "measureType": "quality-assurance",
  "supportsBenefits": ["2.1.1-B1", "2.1.1-B4", "2.1.1-B5"],
  "questionAnswered": "Are colleagues using the evidence to tell accurate, context-sensitive programme stories and interpret caveats responsibly?",
  "measure": "Review of early profiles, caveat use, facilitator feedback and programme confirmation of story material."
}
```

Do not duplicate a measure under every benefit it supports. Prefer one top-level cross-cutting measure with `supportsBenefits` when the same evidence question supports several benefits.

## Evidence of success

Evidence of success should show whether the value is being realised, not just whether an activity happened.

Good evidence can be qualitative, usage-based or judgement-based. It does not need to be purely numerical.

Examples:

- programme teams report that evidence is useful, fair and interpretable;
- programme stories are used in student-facing or applicant-facing contexts;
- guided conversations result in agreed questions, actions or focus areas;
- institutional synthesis is used in planning or related King's Edge work;
- evidence is interpreted with appropriate caveats and academic judgement.

Avoid measures that incentivise programme ranking, league tables, punitive comparison or false precision.

## 2.1.1 framing

For Programme Graduate Futures Insight and Action Packs, keep the framing story-first and improvement-second.

The benefits should emphasise:

- helping programmes tell a stronger, more confident and nuanced story about their students' graduate futures;
- claiming distinctive strengths and excellence with evidence;
- identifying where curriculum, skills, opportunity, support or articulation work could make that story stronger;
- using evidence responsibly, with caveats and academic judgement;
- avoiding league-table, ranking or punitive interpretations;
- feeding shared learning into faculty and institutional planning.

## UI implication

The section heading should avoid the word product. Use either:

- `Value and evidence`; or
- `Benefits and evidence of success`.

The UI should show products and outputs in the Delivery timeline, and only show them in the value section as secondary traceability links under `Enabled by`.

The current UI does not need to render benefit-level measures separately yet. It is acceptable for the visible section to show `evidenceOfSuccess` first, with cross-cutting measures still shown in the evidence column or measures index. A later UI pass can add explicit benefit-level measure rows once more deliverables use them consistently.
