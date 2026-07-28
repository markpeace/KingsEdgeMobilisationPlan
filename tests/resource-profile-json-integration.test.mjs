import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildFinancialProfile } from '../src/resource-profile-utils.js';

function addRuntimeAskTypes(authoredSteps) {
  return authoredSteps.map((step) => ({
    ...step,
    resources: {
      ...step.resources,
      existingCapacity: (step.resources?.existingCapacity || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'existing-capacity'
      })),
      newInvestment: (step.resources?.newInvestment || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'new-investment'
      })),
      enablingConditions: (step.resources?.enablingConditions || []).map((ask) => ({
        ...ask,
        askType: ask.askType || 'enabling-condition'
      }))
    }
  }));
}

function loadAuthoredSteps(relativePath) {
  const document = JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
  return addRuntimeAskTypes(document.steps || []);
}

test('1.4.2 financial profile is generated from the authored JSON', () => {
  const steps = loadAuthoredSteps('../src/data/deliverables/1.4.2/steps.json');
  const profile = buildFinancialProfile(steps);
  const total2728 = profile.phases.find((phase) => phase.year === '2027/28').total;

  assert.ok(steps.length > 0);
  assert.ok(profile.investmentAsks.length > 0);
  assert.equal(profile.mobilisationCost, 9000);
  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 36000);
  assert.ok(total2728 > 249000);
});
