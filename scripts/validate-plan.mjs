import fs from 'node:fs';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

const plan = readJson('../src/data/kings-edge-plan.json');
const outOfProgrammeProjects = readJson('../src/data/enabling-projects.json');
const stepDependencies = readJson('../src/data/step-dependencies.json');
const statusData = readJson('../src/data/status.json');
const workPackageConfig = readJson('../src/data/work-packages.json');

const errors = [];
const warnings = [];
const requiredTimelinePeriods = new Set(plan.timelinePeriods.map((period) => period.id));
const ids = new Set();
const deliverableIds = new Set();
const stepIds = new Set();
const projectIds = new Set();

const allProjects = [
  ...plan.projects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'edge' })),
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

  resources.people?.forEach((person, index) => {
    if (person.fte !== undefined && typeof person.fte !== 'number') errors.push(`${path}.resources.people[${index}].fte should be a number.`);
  });

  resources.cashCosts?.forEach((cost, index) => {
    if (cost.amount !== undefined && typeof cost.amount !== 'number') errors.push(`${path}.resources.cashCosts[${index}].amount should be a number.`);
    if (cost.period && !requiredTimelinePeriods.has(cost.period)) errors.push(`${path}.resources.cashCosts[${index}] uses unknown period: ${cost.period}`);
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
  if (!Array.isArray(steps) || steps.length !== 4) warnings.push(`${ownerPath} should usually contain exactly four delivery steps.`);
  steps?.forEach((step, stepIndex) => {
    const stepPath = `${ownerPath}.steps[${stepIndex}]`;
    addId(step.id, stepPath);
    stepIds.add(step.id);
    ['title', 'period', 'summary'].forEach((field) => requireField(step, field, stepPath));
    if (step.period && !requiredTimelinePeriods.has(step.period)) errors.push(`${step.id} uses unknown timeline period: ${step.period}`);
    validateArrayIfPresent(step.outputs, `${stepPath}.outputs`);
    validateArrayIfPresent(step.decisions, `${stepPath}.decisions`);
    validateArrayIfPresent(step.risks, `${stepPath}.risks`);
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
  if (!Array.isArray(project.deliverables) || project.deliverables.length !== 4) warnings.push(`${project.id} should usually contain exactly four deliverables.`);

  project.deliverables?.forEach((deliverable, deliverableIndex) => {
    const deliverablePath = `${project.id}.deliverables[${deliverableIndex}]`;
    addId(deliverable.id, deliverablePath);
    deliverableIds.add(deliverable.id);
    ['title', 'lead', 'summary', 'problemSolved', 'whatChanges'].forEach((field) => requireField(deliverable, field, deliverablePath));
    if (!Array.isArray(deliverable.components) || deliverable.components.length !== 4) warnings.push(`${deliverable.id} should usually contain exactly four components.`);
    validateSuccessMeasures(deliverable.successMeasures, deliverablePath);
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

(workPackageConfig.projectDisplayOrder || []).forEach((projectId) => {
  if (!projectIds.has(projectId)) errors.push(`work-packages projectDisplayOrder contains unknown project id: ${projectId}`);
});

Object.entries(workPackageConfig.projectDisplayIds || {}).forEach(([projectId, displayId]) => {
  if (!projectIds.has(projectId)) errors.push(`work-packages projectDisplayIds contains unknown project id: ${projectId}`);
  if (typeof displayId !== 'string') errors.push(`work-packages projectDisplayIds.${projectId} should be a string.`);
});

Object.entries(workPackageConfig.deliverableOverrides || {}).forEach(([deliverableId, override]) => {
  if (!deliverableIds.has(deliverableId)) errors.push(`work-packages deliverableOverrides contains unknown deliverable id: ${deliverableId}`);
  if (!override || typeof override !== 'object' || Array.isArray(override)) errors.push(`work-packages deliverableOverrides.${deliverableId} should be an object.`);
});

(workPackageConfig.packages || []).forEach((workPackage, index) => {
  const path = `work-packages.packages[${index}]`;
  requireField(workPackage, 'id', path);
  requireField(workPackage, 'title', path);
  validateArrayIfPresent(workPackage.deliverables, `${path}.deliverables`);
  workPackage.deliverables?.forEach((deliverableId) => {
    if (!deliverableIds.has(deliverableId)) errors.push(`${path} references unknown deliverable id: ${deliverableId}`);
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
