import assert from 'node:assert/strict';
import test from 'node:test';
import {
  academicYearStart,
  buildFinancialProfile,
  financialCategory,
  fundingState,
  resourceGroups,
  resourceSummary,
  valueKind
} from '../src/resource-profile-utils.js';

const steps = [
  {
    id: 'step-1',
    period: 'now-sep-2026',
    resources: {
      existingCapacity: [
        { askType: 'existing-capacity', role: 'Project manager' }
      ],
      newInvestment: [
        {
          askType: 'new-investment',
          item: 'Mobilisation support',
          category: 'temporary project management',
          amount: 20000,
          fundingStatus: 'unconfirmed'
        },
        {
          askType: 'new-investment',
          item: 'Permanent service',
          category: 'portfolio coordination capacity',
          amount: 45000,
          bauLiability: true,
          fte: 0.5,
          periodNeeded: 'From September 2026 onward',
          fundingStatus: 'confirmed'
        }
      ],
      enablingConditions: [
        { askType: 'enabling-condition', condition: 'Confirmed owner' }
      ]
    }
  },
  {
    id: 'step-2',
    period: { start: 'jul-dec-2027:b', end: 'jan-jun-2028:c' },
    resources: {
      existingCapacity: [],
      newInvestment: [
        {
          askType: 'new-investment',
          item: 'Funded convenor protected capacity',
          category: 'community leadership release or backfill',
          amount: 30000,
          fte: 0.3,
          periodNeeded: 'September 2027 to June 2028',
          fundingStatus: 'commissioned for the first funded cycle'
        },
        {
          askType: 'new-investment',
          item: 'Protected capacity for practice-based projects',
          category: 'project lead release or backfill',
          estimatedCost: 'Cash-equivalent',
          fte: 1.5,
          periodNeeded: 'September 2027 to June 2028',
          fundingStatus: 'indicative'
        }
      ],
      enablingConditions: []
    }
  }
];

test('resource groups separate in-year investment from annual recurrent commitments', () => {
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

test('resource summary keeps annual BAU separate from time-limited investment', () => {
  const summary = resourceSummary(steps);
  assert.equal(summary.deliveryInvestmentAsks, 3);
  assert.equal(summary.bauLiabilityAsks, 1);
  assert.equal(summary.knownInvestment, 50000);
  assert.equal(summary.knownAnnualBauLiability, 45000);
  assert.equal(summary.unquantifiedInvestmentAsks, 1);
});

test('academic year parsing handles timeline tokens, objects and prose', () => {
  assert.equal(academicYearStart('jan-jun-2027:b'), 2026);
  assert.equal(academicYearStart('jul-dec-2027:b'), 2027);
  assert.equal(academicYearStart('From September 2028 onward'), 2028);
  assert.equal(
    academicYearStart({ start: 'jan-jun-2029:a', end: 'jul-dec-2029:b' }),
    2028
  );
});

test('financial profile phases recurrent and in-year costs without treating unknown as zero', () => {
  const profile = buildFinancialProfile(steps);
  const phase2627 = profile.phases.find((phase) => phase.year === '2026/27');
  const phase2728 = profile.phases.find((phase) => phase.year === '2027/28');

  assert.equal(phase2627.total, 65000);
  assert.equal(phase2627.fte, 0.5);
  assert.equal(phase2728.total, 75000);
  assert.equal(phase2728.fte, 2.3);
  assert.equal(phase2728.unquantified, 1);
  assert.equal(profile.exitRunRate, 75000);
  assert.equal(profile.peakFte, 2.3);
});

test('funding and value classifications preserve uncertainty', () => {
  assert.equal(fundingState({ fundingStatus: 'unconfirmed' }), 'unresolved');
  assert.equal(
    fundingState({ fundingStatus: 'commissioned for the first funded cycle' }),
    'confirmed'
  );
  assert.equal(
    valueKind({
      amount: 10000,
      fte: 0.1,
      category: 'release or backfill',
      estimatedCost: 'cash-equivalent'
    }),
    'cash-equivalent'
  );
  assert.equal(valueKind({ amount: 1000, category: 'direct delivery' }), 'cash');
  assert.equal(valueKind({ estimatedCost: 'TBC' }), 'unquantified');
  assert.equal(
    financialCategory({ item: 'Direct delivery costs for practice-based projects' }),
    'project-direct-costs'
  );
});
