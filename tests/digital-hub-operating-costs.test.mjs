import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { stepsForResourceContext } from '../src/resource-profile-context.js';
import { buildFinancialProfile } from '../src/resource-profile-utils.js';

function load(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

function addRuntimeAskTypes(steps) {
  return (steps || []).map((step) => ({
    ...step,
    resources: {
      ...step.resources,
      existingCapacity: (step.resources?.existingCapacity || []).map((ask) => ({ ...ask, askType: 'existing-capacity' })),
      newInvestment: (step.resources?.newInvestment || []).map((ask) => ({ ...ask, askType: 'new-investment' })),
      enablingConditions: (step.resources?.enablingConditions || []).map((ask) => ({ ...ask, askType: 'enabling-condition' }))
    }
  }));
}

function profileFor(item) {
  const context = { type: 'deliverable', item };
  return buildFinancialProfile(stepsForResourceContext(context));
}

test('4.1.2 recurring operating costs replace one-off Azure and student co-design asks', () => {
  const timeline = load('../src/data/deliverables/4.1.2/timeline-reflow.json');
  const operating = load('../src/data/deliverables/4.1.2/operating-costs.json');
  const profile = profileFor({
    id: '4.1.2',
    title: 'Student App and Journey Integration',
    steps: addRuntimeAskTypes(timeline.steps),
    ...operating
  });

  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 115000);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 165000);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 215000);
  assert.equal(profile.knownAnnualBauLiability, 215000);
  assert.equal(profile.bauLiabilityAsks.length, 3);
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.2-y1-platform-envelope'));
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.2-y1-student-codesign-internships'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.2-operating-runtime-ai'));
});

test('4.1.3 applies Product Manager sharing and confirmed Year One architecture phasing', () => {
  const baseline = load('../src/data/deliverables/4.1.3/it-resource-baseline.json');
  const recurrence = load('../src/data/deliverables/4.1.3/it-resource-recurrence.json');
  const workforce = load('../src/data/deliverables/4.1.3/it-resource-workforce.json').workforceModel;
  const profile = profileFor({
    id: '4.1.3',
    title: 'Digital Innovation and Product Development Capability',
    steps: addRuntimeAskTypes(baseline.steps),
    ...recurrence,
    workforceModel: workforce
  });

  const permanent = workforce.appointments.filter((appointment) => appointment.appointmentBasis === 'permanent');
  const placements = workforce.appointments.filter((appointment) => appointment.appointmentBasis === 'placement');
  const productManager = permanent.find((appointment) => appointment.role === 'Product Manager');
  const architect = workforce.appointments.find((appointment) => appointment.resourceId === '4.1.3-y1-role-solution-architect');

  assert.equal(permanent.length, 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.fte, 0), 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.annualBauAmount, 0), 276072);
  assert.equal(productManager?.institutionalAnnualCost, 95568);
  assert.equal(productManager?.studentHubAllocatedFte, 0.5);
  assert.equal(productManager?.staffHubAllocatedFte, 0.5);
  assert.equal(productManager?.annualBauAmount, 47784);
  assert.equal(architect?.yearOneAverageFte, 0.75);

  assert.equal(placements.length, 1);
  assert.equal(placements[0].annualBauAmount, 35000);
  assert.ok(!workforce.appointments.some((appointment) => appointment.resourceId === '4.1.3-y1-role-qa-infuse'));

  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 445360);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 678296);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 678296);
  assert.equal(profile.knownAnnualBauLiability, 678296);

  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-y1-role-product-manager'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-operating-product-manager-student-share'));
  assert.equal(profile.asks.find((ask) => ask.id === '4.1.3-operating-product-manager-student-share')?.fte, 0.5);

  const architectAsks = profile.asks.filter((ask) => ask.id === '4.1.3-y1-role-solution-architect');
  assert.equal(architectAsks.length, 1);
  assert.equal(architectAsks[0]?.fte, 0.75);
  assert.equal(architectAsks[0]?.yearlyProfile?.find((entry) => entry.academicYear === '2026/27')?.amount, 40512);
  assert.equal(architectAsks[0]?.yearlyProfile?.find((entry) => entry.academicYear === '2027/28')?.amount, 81024);

  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-y1-role-qa-infuse'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-operating-infuse-qa-nonpay'));
  assert.equal(profile.asks.find((ask) => ask.id === '4.1.3-operating-infuse-qa-nonpay')?.category, 'non-pay: outsourced testing service');
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-permanent-product-core'));
  assert.equal(profile.asks.find((ask) => ask.id === '4.1.3-bau-permanent-product-core')?.amount, 276072);
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-specialist-workforce-high-water'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-infuse-qa-nonpay'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-rolling-sandwich-placement'));
  assert.equal(profile.asks.find((ask) => ask.id === '4.1.3-bau-infuse-qa-nonpay')?.category, 'non-pay: outsourced testing service');
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-y2-y3-platform-high-water-hold'));
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-bau-platform-high-water'));
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-bau-worst-case-staffing'));

  assert.equal(recurrence.fundingEnvelope.confirmedYearOneArchitecturePhasing.yearOneAverageFte, 0.75);
  assert.equal(recurrence.fundingEnvelope.confirmedYearOneArchitecturePhasing.yearOneReduction, 13504);
  assert.equal(recurrence.fundingEnvelope.hubTotal.yearOne, 593360);
  assert.equal(recurrence.fundingEnvelope.hubTotal.threeYearTotal, 2395952);
  assert.equal(recurrence.fundingEnvelope.hubTotal.remainingHeadroom, 604048);
  assert.equal(recurrence.fundingEnvelope.worstCaseBauRunRate.knownTotalBeforeKnowledgeContent, 893296);
});
