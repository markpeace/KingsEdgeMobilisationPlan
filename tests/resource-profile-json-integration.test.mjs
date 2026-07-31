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

function loadDocument(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

test('1.4.2 financial profile is generated from the revised authored JSON', () => {
  const document = loadDocument('../src/data/deliverables/1.4.2/steps.json');
  const steps = addRuntimeAskTypes(document.steps || []);
  const profile = buildFinancialProfile(steps);

  assert.ok(steps.length > 0);
  assert.equal(profile.mobilisationCost, 2000);
  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 12500);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 22000);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 220800);
  assert.equal(profile.knownAnnualBauLiability, 220800);
  assert.equal(profile.exitRunRate, 220800);

  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'mobilisation').totalResourceValue, 40500);
  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'first-supported-cycle').totalResourceValue, 110400);
  assert.equal(document.resourceModel.phases.find((phase) => phase.id === 'mature-six-community-model').totalResourceValue, 220800);
  assert.equal(document.resourceModel.replacementCapacity.hourlyPlanningRate, 40);
  assert.equal(document.resourceModel.replacementCapacity.convenorHoursPerCommunityTeam, 120);
  assert.equal(document.resourceModel.replacementCapacity.standardProjectHours, 80);
});
