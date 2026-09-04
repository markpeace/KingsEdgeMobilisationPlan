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

test('4.1.3 distinguishes the permanent four-post core from high-water specialist service capacity', () => {
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
  assert.equal(permanent.length, 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.fte, 0), 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.annualBauAmount, 0), 323856);

  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 490720);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 726080);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 726080);
  assert.equal(profile.knownAnnualBauLiability, 691080);
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-y2-y3-platform-high-water-hold'));
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-bau-platform-high-water'));
  assert.ok(!profile.asks.some((ask) => ask.id === '4.1.3-bau-worst-case-staffing'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-permanent-product-core'));
  assert.ok(profile.asks.some((ask) => ask.id === '4.1.3-bau-specialist-service-high-water'));
});
