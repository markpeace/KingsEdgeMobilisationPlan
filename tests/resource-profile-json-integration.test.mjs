import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { hasResourceProfileForContext, stepsForResourceContext } from '../src/resource-profile-context.js';
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

function deliverableContext(id, title, steps, workforceModel = null) {
  return {
    type: 'deliverable',
    item: {
      id,
      title,
      steps: addRuntimeAskTypes(steps),
      ...(workforceModel ? { workforceModel } : {})
    }
  };
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

test('4.1.3 separates permanent workforce intent, mobilisation spend and BAU operating budget', () => {
  const timeline = loadDocument('../src/data/deliverables/4.1.3/timeline-reflow.json');
  const workforce = loadDocument('../src/data/deliverables/4.1.3/workforce.json').workforceModel;
  const steps = addRuntimeAskTypes(timeline.steps || []);
  const profile = buildFinancialProfile(steps);
  const permanent = workforce.appointments.filter((appointment) => appointment.appointmentBasis === 'permanent');
  const placements = workforce.appointments.filter((appointment) => appointment.appointmentBasis === 'placement');
  const agenticBau = profile.bauLiabilityAsks.find((ask) => ask.id === '4.1.3-bau-agentic-development');

  assert.equal(permanent.length, 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.fte, 0), 4);
  assert.equal(permanent.reduce((total, appointment) => total + appointment.annualBauAmount, 0), 304000);
  assert.equal(placements.length, 1);
  assert.equal(placements[0].resourceId, '4.1.3-y2-y3-junior-fullstack-placement');

  assert.equal(profile.knownInvestment, 1151000);
  assert.equal(profile.knownAnnualBauLiability, 394000);
  assert.equal(profile.bauLiabilityAsks.length, 2);
  assert.equal(agenticBau?.amount, 90000);
  assert.equal(agenticBau?.periodNeeded, 'July 2029 onward');
  assert.equal(profile.phases.find((phase) => phase.year === '2026/27').total, 293000);
  assert.equal(profile.phases.find((phase) => phase.year === '2027/28').total, 429000);
  assert.equal(profile.phases.find((phase) => phase.year === '2028/29').total, 429000);
});

test('the shared resource profile recognises materially different deliverable resource models', () => {
  const community = loadDocument('../src/data/deliverables/1.4.2/steps.json');
  const opportunities = loadDocument('../src/data/deliverables/2.2.4/steps.json');
  const digital = loadDocument('../src/data/deliverables/4.1.3/timeline-reflow.json');
  const workforce = loadDocument('../src/data/deliverables/4.1.3/workforce.json').workforceModel;

  const contexts = [
    deliverableContext('1.4.2', 'Community infrastructure', community.steps || []),
    deliverableContext('2.2.4', 'Beyond-course opportunity commissioning and growth', opportunities.steps || []),
    deliverableContext('4.1.3', 'Digital product team and platform capability', digital.steps || [], workforce)
  ];

  contexts.forEach((context) => {
    assert.equal(hasResourceProfileForContext(context), true, `${context.item.id} should render the shared resource profile`);
    assert.ok(stepsForResourceContext(context).some((step) =>
      (step.resources?.newInvestment?.length || 0) +
      (step.resources?.existingCapacity?.length || 0) +
      (step.resources?.enablingConditions?.length || 0) > 0
    ));
  });

  const projectContext = {
    type: 'project',
    item: {
      id: 'test-project',
      title: 'Shared project context',
      deliverables: contexts.map((context) => context.item)
    }
  };
  assert.equal(hasResourceProfileForContext(projectContext), true);
  assert.ok(stepsForResourceContext(projectContext).length > contexts[0].item.steps.length);
});

test('the shared resource profile stays absent when a deliverable has no resource asks', () => {
  const context = deliverableContext('test-empty', 'No resources', [{ id: 'step-1', title: 'Do something', period: 'jul-dec-2026:a' }]);
  assert.equal(hasResourceProfileForContext(context), false);
});
