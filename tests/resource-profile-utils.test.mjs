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
        { askType: 'new-investment', item: 'Mobilisation support', category: 'temporary project management', amount: 20000, fundingStatus: 'unconfirmed' },
        { askType: 'new-investment', item: 'Permanent service', category: 'portfolio coordination capacity', amount: 45000, bauLiability: true, fte: 0.5, periodNeeded: 'From September 2026 onward', fundingStatus: 'confirmed' }
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
        { askType: 'new-investment', item: 'Funded convenor protected capacity', category: 'community leadership release or backfill', amount: 30000, fte: 0.3, periodNeeded: 'September 2027 to June 2028', fundingStatus: 'commissioned for the first funded cycle' },
        { askType: 'new-investment', item: 'Protected capacity for practice-based projects', category: 'project lead release or backfill', estimatedCost: 'Cash-equivalent', fte: 1.5, periodNeeded: 'September 2027 to June 2028', fundingStatus: 'indicative' }
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
  assert.equal(academicYearStart({ start: 'jan-jun-2029:a', end: 'jul-dec-2029:b' }), 2028);
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
  assert.equal(fundingState({ fundingStatus: 'commissioned for the first funded cycle' }), 'confirmed');
  assert.equal(valueKind({ amount: 10000, fte: 0.1, category: 'release or backfill', estimatedCost: 'cash-equivalent' }), 'cash-equivalent');
  assert.equal(valueKind({ amount: 1000, category: 'direct delivery' }), 'cash');
  assert.equal(valueKind({ estimatedCost: 'TBC' }), 'unquantified');
  assert.equal(financialCategory({ item: 'Direct delivery costs for practice-based projects' }), 'project-direct-costs');
});

test('1.4.2 planning assumptions produce the intended phased profile', () => {
  const scopSteps = [
    {
      id: 'launch',
      period: 'now-sep-2026',
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Unconference catering and refreshments', category: 'event delivery', amount: 2000, fundingStatus: 'unconfirmed' }
      ] }
    },
    {
      id: 'model',
      period: { start: 'jul-dec-2026:b', end: 'jul-dec-2026:c' },
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Temporary SCoP Mobilisation Project Manager', category: 'temporary project management', amount: 7000, fte: 0.1, periodNeeded: { start: 'jul-dec-2026:b', end: 'jul-dec-2027:a' }, fundingStatus: 'unconfirmed' },
        { askType: 'new-investment', item: "King's Academy SCoP Project Support Officer and Portfolio Coordinator", category: 'permanent portfolio administration', amount: 11000, fte: 0.2, bauLiability: true, periodNeeded: 'From September 2026 onward', fundingStatus: 'unconfirmed' },
        { askType: 'new-investment', item: "King's Academy SCoP Portfolio Lead workload release or backfill", category: 'permanent portfolio leadership', amount: 10000, fte: 0.1, bauLiability: true, periodNeeded: 'From September 2026 onward', fundingStatus: 'unconfirmed' }
      ] }
    },
    {
      id: 'pilot',
      period: { start: 'jul-dec-2026:c', end: 'jan-jun-2027:c' },
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Base community activity and engagement allowance', category: 'recurrent community operating funding', amount: 12000, bauLiability: true, periodNeeded: 'From November 2026 onward; £6,000 for the November 2026-June 2027 pilot and £12,000 per full academic year thereafter', fundingStatus: 'unconfirmed' }
      ] }
    },
    {
      id: 'expand-support',
      period: 'jul-dec-2027:a',
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Additional Portfolio Lead workload release or backfill', category: 'permanent portfolio leadership', amount: 10000, fte: 0.1, bauLiability: true, periodNeeded: 'From September 2027 onward', fundingStatus: 'unconfirmed' },
        { askType: 'new-investment', item: 'Additional Portfolio Coordinator capacity', category: 'permanent portfolio administration', amount: 11000, fte: 0.2, bauLiability: true, periodNeeded: 'From September 2027 onward', fundingStatus: 'unconfirmed' }
      ] }
    },
    {
      id: 'three-community-cycle',
      period: { start: 'jul-dec-2027:b', end: 'jan-jun-2028:c' },
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Funded convenor protected capacity for the first three communities', category: 'community leadership release or backfill', amount: 30000, fte: 0.3, periodNeeded: 'September 2027 to June 2028', fundingStatus: 'commissioned for the first funded cycle' },
        { askType: 'new-investment', item: 'Protected capacity for the first annual practice-based project portfolio', category: 'project lead release or backfill', amount: 150000, fte: 1.5, periodNeeded: 'September 2027 to June 2028', fundingStatus: 'commissioned for the first funded cycle' },
        { askType: 'new-investment', item: 'Direct delivery costs for the first practice-based project portfolio', category: 'practice-based project delivery', amount: 15000, periodNeeded: 'September 2027 to June 2028', fundingStatus: 'commissioned for the first funded cycle' }
      ] }
    },
    {
      id: 'six-community-expansion',
      period: { start: 'jan-jun-2028:a', end: 'jan-jun-2028:b' },
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Additional annual base activity allowance for the three new communities', category: 'recurrent community activity funding', amount: 12000, bauLiability: true, periodNeeded: 'From September 2028 onward', fundingStatus: 'unconfirmed' },
        { askType: 'new-investment', item: 'Further Portfolio Lead workload release or backfill', category: 'portfolio leadership capacity', amount: 20000, fte: 0.2, bauLiability: true, periodNeeded: 'From September 2028 onward', fundingStatus: 'indicative' },
        { askType: 'new-investment', item: 'Further Portfolio Coordinator capacity', category: 'portfolio coordination capacity', amount: 22000, fte: 0.4, bauLiability: true, periodNeeded: 'From September 2028 onward', fundingStatus: 'indicative' }
      ] }
    },
    {
      id: 'six-community-cycle',
      period: { start: 'jul-dec-2028:b', end: 'jan-jun-2029:c' },
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Funded convenor protected capacity across six communities', category: 'community leadership release or backfill', amount: 60000, fte: 0.6, periodNeeded: 'September 2028 to June 2029', fundingStatus: 'commissioned for the six-community operating cycle' },
        { askType: 'new-investment', item: 'Protected capacity for the 2028-29 practice-based project portfolio', category: 'project lead release or backfill', amount: 300000, fte: 3, periodNeeded: 'September 2028 to June 2029', fundingStatus: 'commissioned for the six-community operating cycle' },
        { askType: 'new-investment', item: 'Direct delivery costs for the 2028-29 practice-based project portfolio', category: 'practice-based project delivery', amount: 30000, periodNeeded: 'September 2028 to June 2029', fundingStatus: 'commissioned for the six-community operating cycle' }
      ] }
    },
    {
      id: 'permanent',
      period: 'jul-dec-2029:a',
      resources: { existingCapacity: [], enablingConditions: [], newInvestment: [
        { askType: 'new-investment', item: 'Permanent funded convenor protected-capacity envelope', category: 'permanent recurrent community leadership release or backfill', amount: 60000, fte: 0.6, bauLiability: true, periodNeeded: 'From September 2029 onward', fundingStatus: 'indicative' },
        { askType: 'new-investment', item: 'Permanent annual practice-based project protected-capacity envelope', category: 'permanent recurrent project release or backfill', amount: 300000, fte: 3, bauLiability: true, periodNeeded: 'From September 2029 onward', fundingStatus: 'indicative' },
        { askType: 'new-investment', item: 'Permanent annual direct delivery allowance for practice-based projects', category: 'permanent recurrent project delivery funding', amount: 30000, bauLiability: true, periodNeeded: 'From September 2029 onward', fundingStatus: 'indicative' }
      ] }
    }
  ];

  const profile = buildFinancialProfile(scopSteps);
  assert.equal(profile.mobilisationCost, 9000);
  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 36000);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 249000);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 498000);
  assert.equal(profile.phases.find((phase) => phase.year === '2029/30').total, 498000);
  assert.equal(profile.exitRunRate, 498000);
  assert.ok(Math.abs(profile.peakFte - 4.8) < 1e-9);
});
