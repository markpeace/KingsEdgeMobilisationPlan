# Value and evidence model

## Principle

The deliverable page separates delivery from value.

The Delivery timeline is the source of truth for delivery. It owns steps, timing, products, outputs, dependencies, resources, decisions, risks, assumptions and completion evidence.

The Benefits and evidence section explains the value the deliverable is expected to create and how we will know that value is being realised. It should not create a second delivery plan.

Use one chain:

```text
Timeline outputs -> benefit -> what success looks like -> linked measures
```

The app presents linked measures under the reader-facing heading `How we will know`.

## Canonical model

### Benefit

A benefit describes a worthwhile change for identifiable beneficiaries.

Author:

- `id`;
- `title`;
- `statement`;
- `beneficiary`;
- `benefitType` where useful;
- `realisationPeriod`;
- `successLooksLike`;
- `enabledBy` references to timeline steps or outputs.

Do not author products, tasks or activities as benefits.

### Measure

A measure describes how we will know whether one or more benefits are being realised.

Author each measure once at deliverable level and link it through `supportsBenefits`.

Author:

- `id`;
- `title`;
- `supportsBenefits`;
- `questionAnswered`;
- `measure`;
- `baseline` where known;
- `target` or qualitative success threshold;
- `owner`;
- `cadence`;
- `confidence` where useful.

A measure can support more than one benefit. Do not duplicate it under every benefit.

### Evidence of success

`How we will know` is a presentation label, not a second authored data structure.

The app derives the evidence shown under each benefit from measures whose `supportsBenefits` includes that benefit ID.

The older benefit fields `evidenceOfSuccess` and nested `measures` remain readable for backwards compatibility, but new authoring should not use them.

## Authoring rule

Do not create new products or outputs in the value section.

Products and outputs belong in the timeline. If a benefit depends on a pack, profile, conversation model, dashboard or synthesis, author that item on the relevant delivery step and reference it through `enabledBy`.

A benefit should describe value realised through use, not the thing being produced.

## Example

```json
{
  "benefits": [
    {
      "id": "2.1.1-B1",
      "title": "Programmes can claim their graduate futures value with confidence",
      "statement": "Programme teams can make stronger, more nuanced and evidence-informed claims about the futures their programme makes possible for students.",
      "beneficiary": "Programme teams, students, applicants and faculties",
      "realisationPeriod": "2026/27 onwards",
      "successLooksLike": "Programme-level graduate futures stories are confident, evidence-linked, academically owned and appropriately caveated.",
      "enabledBy": [
        {
          "stepId": "2.1.1-step-1",
          "outputTitle": "First working graduate futures evidence pack"
        }
      ]
    }
  ],
  "measures": [
    {
      "id": "2.1.1-M1",
      "title": "Programme graduate futures profiles completed and confirmed",
      "supportsBenefits": ["2.1.1-B1"],
      "questionAnswered": "Are agreed programme groups producing credible graduate futures profiles that programme teams recognise and can use?",
      "measure": "Count and percentage of agreed programme groups with a completed and programme-confirmed profile or equivalent story artefact.",
      "baseline": "0 through this model.",
      "target": "Each agreed programme group completes and confirms a proportionate story artefact before wider use."
    }
  ]
}
```

## Distinguishing benefit measures from delivery controls

Benefit measures test whether value is being realised.

Examples:

- programme teams confirm that a story is accurate, useful and appropriately caveated;
- graduate futures stories are used in review, recruitment or student-facing contexts;
- guided conversations generate agreed strengths, questions, support needs or actions;
- agreed insights enter normal programme or faculty planning;
- recurring themes inform King's-level synthesis.

Delivery controls test whether work has been completed or accepted.

Examples:

- evidence specification completed;
- first pack produced;
- user testing session held;
- guidance approved;
- handoff route agreed.

Keep delivery controls with the relevant timeline step, output acceptance criteria or milestone. Do not count them as evidence that a benefit has already been realised.

## Proportionate measurement

Measures may be quantitative, qualitative, usage-based or judgement-based.

Do not force a numerical target where that would create false precision. A credible qualitative threshold can be stronger than an arbitrary percentage.

Avoid measures that incentivise programme ranking, league tables, punitive comparison or unsupported claims of causality.

## 2.1.1 framing

For Programme Graduate Futures Insight and Action Packs, keep the framing story-first and improvement-second.

The benefits should emphasise:

- stronger, more confident and nuanced programme graduate futures stories;
- evidence-informed claims about distinctive value and excellence;
- identification of focused enhancement opportunities;
- responsible interpretation with caveats and academic judgement;
- no ranking, league-table or punitive programme comparison;
- feed-through of shared learning into faculty and King's-level planning.

## UI implication

Use the section heading `Benefits and evidence`.

For each benefit, show:

- the benefit title and statement;
- beneficiary and realisation period;
- what success means;
- linked measures under `How we will know`;
- secondary `Enabled by` references back to timeline outputs.

Keep full measure detail compact or expandable so the section remains readable.
