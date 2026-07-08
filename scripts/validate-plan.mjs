import fs from 'node:fs';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

const plan = readJson('../src/data/kings-edge-plan.json');
const graduateFutures211 = readJson('../src/data/deliverable-overrides/2.1.1.json');
const graduateFutures211Overview = readJson('../src/data/deliverable-overrides/2.1.1-overview-patch.json');
const graduateFutures211OutputsMeasures = readJson('../src/data/deliverable-overrides/2.1.1-outputs-measures-patch.json');
const graduateFutures211Steps = readJson('../src/data/deliverable-overrides/2.1.1-steps-patch.json');
const outOfProgrammeProjects = readJson('../src/data/enabling-projects.json');
const stepDependencies = readJson('../src/data/step-dependencies.json');
const statusData = readJson('../src/data/status.json');

const errors = [];
const warnings = [];
const timelineBucketIds = new Set(['jul-dec-2026', ...[2027, 2028, 2029, 2030].flatMap((year) => [`jan-jun-${year}`, `jul-dec-${year}`])]);
const timelineThirdIds = new Set([...timelineBucketIds].flatMap((bucket) => ['a', 'b', 'c'].map((third) => `${bucket}-${third}`)));
const legacyTimelineIds = new Set([
  'now-xmas-2026',
  'jan-summer-2027',
  'ay-2027-28-to-2028-29',
  'ay-2029-30',
  'now-sep-2026',
  'oct-2026-mar-2027',
  'apr-sep-2027',
  'oct-2027-mar-2028',
  'apr-sep-2028',
  'oct-2028-mar-2029',
  'apr-sep-2029',
  'oct-2029-mar-2030',
  'apr-sep-2030'
]);
const requiredTimelinePeriods = new Set([
  ...plan.timelinePeriods.map((period) => period.id),
  ...timelineBucketIds,
  ...timelineThirdIds,
  ...legacyTimelineIds
]);
const validThirdSegments = new Set(['a', 'b', 'c', 'ab', 'bc', 'abc']);
const ids = new Set();
const deliverableIds = new Set();
const stepIds = new Set();
const projectIds = new Set();

function timelinePeriodKey(period) {
  if (period && typeof period === 'object') return period.bucket || period.period || period.id;
  return String(period || '').split(':')[0];
}

function timelinePeriodSegment(period) {
  if (period && typeof period === 'object') return period.segment || period.third || period.part || 'abc';
  return String(period || '').split(':')[1] || 'abc';
}

function validateTimelinePeriod(period, path) {
  if (!period) return;
  const bucket = timelinePeriodKey(period);
  const segment = timelinePeriodSegment(period).toLowerCase();
  if (!requiredTimelinePeriods.has(bucket)) errors.push(`${path} uses unknown timeline period: ${period}`);
  if (String(period).includes(':') || (period && typeof period === 'object')) {
    if (!validThirdSegments.has(segment)) errors.push(`${path} uses unknown timeline segment: ${segment}`);
  }
}

function mergeDeliverableOverride(...overrides) {
  return overrides.reduce((merged, override) => {
    const resources = override.resources
      ? {
          ...(merged.resources || {}),
          ...override.resources,
          investmentAsk: {
            ...(merged.resources?.investmentAsk || {}),
            ...(override.resources?.investmentAsk || {})
          }
        }
      : merged.resources;
    return {
      ...merged,
      ...override,
      caseForChange: {
        ...(merged.caseForChange || {}),
        ...(override.caseForChange || {})
      },
      ownership: {
        ...(merged.ownership || {}),
        ...(override.ownership || {})
      },
      resources
    };
  }, {});
}

const graduateFutures211Merged = mergeDeliverableOverride(
  graduateFutures211,
  graduateFutures211Overview,
  graduateFutures211OutputsMeasures,
  graduateFutures211Steps
);
const deliverableOverrides = new Map([[graduateFutures211Merged.id, graduateFutures211Merged]]);

function applyDeliverableOverrides(project) {
  if (!Array.isArray(project.deliverables)) return project;
  return {
    ...project,
    deliverables: project.deliverables.map((deliverable) => deliverableOverrides.get(deliverable.id) || deliverable)
  };
}

const allProjects = [
  ...plan.projects.map((project) => applyDeliverableOverrides({ ...project, deliveryContext: project.deliveryContext || 'edge' })),
  ...outOfProgrammeProjects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }))
];

function requireField(object, field, path) {
  if (!object[field]) errors.push(`${path} is missing required field: ${field}`);
}

function addId(id, path) {
  if (!id) {
    errors.push(`${path} is missing an id`);
    return;
  }
  if (ids.has(id)) errors.push(`Duplicate id found: ${id}`);
  ids.add(id);
}

function validateArrayIfPresent(value, path) {
  if (value !== undefined && !Array.isArray(value)) errors.push(`${path} should be an array.`);
}

function validateResources(resources, path) {
  if (resources === undefined) return;
  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) {
    errors.push(`${path}.resources should be an object.`);
    return;
  }
  validateArrayIfPresent(resources.people, `${path}.resources.people`);
  validateArrayIfPresent(resources.cashCosts, `${path}.resources.cashCosts`);
  validateArrayIfPresent(resources.nonCashNeeds, `${path}.resources.nonCashNeeds`);
  validateArrayIfPresent(resources.existingCapacity, `${path}.resources.existingCapacity`);
  validateArrayIfPresent(resources.newInvestment, `${path}.resources.newInvestment`);
  validateArrayIfPresent(resources.enablingConditions, `${path}.resources.enablingConditions`);
  resources.people?.forEach((person, index) => {
    if (person.fte !== undefined && typeof person.fte !== 'number') errors.push(`${path}.resources.people[${index}].fte should be a number.`);
  });
  resources.cashCosts?.forEach((cost, index) => {
    if (cost.amount !== undefined && typeof cost.amount !== 'number') errors.push(`${path}.resources.cashCosts[${index}].amount should be a number.`);
    validateTimelinePeriod(cost.period, `${path}.resources.cashCosts[${index}]`);
  });
}

function validateSuccessMeasures(successMeasures, path) {
  if (successMeasures === undefined) return;
  if (!successMeasures || typeof successMeasures !== 'object' || Array.isArray(successMeasures)) {
    errors.push(`${path}.successMeasures should be an object.`);
    return;
  }
  validateArrayIfPresent(successMeasures.outputs, `${path}.successMeasures.outputs`);
  validateArrayIfPresent(successMeasures.kpis, `${path}.successMeasures.kpis`);
}

function validateSteps(steps, ownerPath) {
  if (steps === undefined) return;
  if (!Array.isArray(steps)) {
    errors.push(`${ownerPath}.steps should be an array.`);
    return;
  }
  steps.forEach((step, stepIndex) => {
    const stepPath = `${ownerPath}.steps[${stepIndex}]`;
    addId(step.id, stepPath);
    stepIds.add(step.id);
    ['title', 'period', 'summary'].forEach((field) => requireField(step, field, stepPath));
    validateTimelinePeriod(step.period, `${step.id}`);
    validateArrayIfPresent(step.outputs, `${stepPath}.outputs`);
    validateArrayIfPresent(step.decisions, `${stepPath}.decisions`);
    validateArrayIfPresent(step.risks, `${stepPath}.risks`);
    validateArrayIfPresent(step.issues, `${stepPath}.issues`);
    validateArrayIfPresent(step.assumptions, `${stepPath}.assumptions`);
    validateResources(step.resources, stepPath);
  });
}

allProjects.forEach((project, projectIndex) => {
  const projectPath = `projects[${projectIndex}]`;
  addId(project.id, projectPath);
  projectIds.add(project.id);
  requireField(project, 'title', projectPath);
  requireField(project, 'owner', projectPath);
  requireField(project, 'summary', projectPath);
  requireField(project, 'deliveryContext', projectPath);
  if (!['edge', 'out-of-programme'].includes(project.deliveryContext)) errors.push(`${project.id} uses unknown deliveryContext: ${project.deliveryContext}`);
  if (!Array.isArray(project.deliverables)) errors.push(`${project.id} should contain a deliverables array.`);
  project.deliverables?.forEach((deliverable, deliverableIndex) => {
    const deliverablePath = `${project.id}.deliverables[${deliverableIndex}]`;
    addId(deliverable.id, deliverablePath);
    deliverableIds.add(deliverable.id);
    ['title', 'lead', 'summary', 'problemSolved', 'whatChanges'].forEach((field) => requireField(deliverable, field, deliverablePath));
    validateArrayIfPresent(deliverable.components, `${deliverablePath}.components`);
    validateArrayIfPresent(deliverable.benefits, `${deliverablePath}.benefits`);
    validateArrayIfPresent(deliverable.outputs, `${deliverablePath}.outputs`);
    validateArrayIfPresent(deliverable.measures, `${deliverablePath}.measures`);
    validateArrayIfPresent(deliverable.definitionOfDone, `${deliverablePath}.definitionOfDone`);
    validateArrayIfPresent(deliverable.dependencies, `${deliverablePath}.dependencies`);
    validateArrayIfPresent(deliverable.feedsInto, `${deliverablePath}.feedsInto`);
    validateArrayIfPresent(deliverable.relatedDeliverables, `${deliverablePath}.relatedDeliverables`);
    validateArrayIfPresent(deliverable.assumptions, `${deliverablePath}.assumptions`);
    validateArrayIfPresent(deliverable.issues, `${deliverablePath}.issues`);
    validateArrayIfPresent(deliverable.risks, `${deliverablePath}.risks`);
    validateArrayIfPresent(deliverable.decisions, `${deliverablePath}.decisions`);
    validateSuccessMeasures(deliverable.successMeasures, deliverablePath);
    validateResources(deliverable.resources, deliverablePath);
    validateSteps(deliverable.steps, deliverable.id);
  });
});

const validReferenceIds = new Set([...projectIds, ...deliverableIds, ...stepIds]);

allProjects.forEach((project) => {
  project.deliverables?.forEach((deliverable) => {
    deliverable.feedsInto?.forEach((targetId) => {
      if (!validReferenceIds.has(targetId)) errors.push(`${deliverable.id} feedsInto target not found: ${targetId}`);
    });
    deliverable.relatedDeliverables?.forEach((targetId) => {
      if (!validReferenceIds.has(targetId)) errors.push(`${deliverable.id} relatedDeliverables target not found: ${targetId}`);
    });
    deliverable.steps?.forEach((step) => {
      step.dependsOn?.forEach((targetId) => {
        if (!validReferenceIds.has(targetId)) errors.push(`${step.id} dependsOn target not found: ${targetId}`);
      });
    });
  });
  project.servesDeliverables?.forEach((targetId) => {
    if (!validReferenceIds.has(targetId)) errors.push(`${project.id} servesDeliverables target not found: ${targetId}`);
  });
});

Object.entries(stepDependencies).forEach(([stepId, targets]) => {
  if (!stepIds.has(stepId)) errors.push(`step-dependencies key is not a known step id: ${stepId}`);
  targets.forEach((targetId) => {
    if (!stepIds.has(targetId)) errors.push(`${stepId} has unknown step dependency target: ${targetId}`);
  });
});

Object.keys(statusData.items || {}).forEach((itemId) => {
  if (!validReferenceIds.has(itemId)) warnings.push(`status.json contains status for unknown or currently unused id: ${itemId}`);
});

if (warnings.length) {
  console.warn('Plan validation warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
if (errors.length) {
  console.error('Plan validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Plan validation passed.');
