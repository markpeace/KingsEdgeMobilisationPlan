import assert from 'node:assert/strict';
import test from 'node:test';
import { resourceGroups, resourceSummary } from '../src/resource-profile-utils.js';

const steps = [
  {
    resources: {
      existingCapacity: [
        { askType: 'existing-capacity', role: 'Project manager' }
      ],
      newInvestment: [
        { askType: 'new-investment', item: 'Mobilisation support', amount: 20000 },
        { askType: 'new-investment', item: 'Permanent service', amount: 45000, bauLiability: true }
      ],
      enablingConditions: [
        { askType: 'enabling-condition', condition: 'Confirmed owner' }
      ]
    }
  }
];

test('resource groups separate delivery investment from BAU liabilities', () => {
  const groups = resourceGroups(steps[0]);
  assert.deepEqual(groups.map((group) => group.key), [
    'existing-capacity',
    'new-investment',
    'bau-liability',
    'enabling-condition'
  ]);
  assert.equal(groups.find((group) => group.key === 'new-investment').items.length, 1);
  assert.equal(groups.find((group) => group.key === 'bau-liability').items.length, 1);
});

test('resource summary does not double count annual BAU liability as delivery investment', () => {
  const summary = resourceSummary(steps);
  assert.equal(summary.deliveryInvestmentAsks, 1);
  assert.equal(summary.bauLiabilityAsks, 1);
  assert.equal(summary.knownInvestment, 20000);
  assert.equal(summary.knownAnnualBauLiability, 45000);
});
