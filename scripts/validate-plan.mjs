import fs from 'node:fs';

const planPath = new URL('../src/data/kings-edge-plan.json', import.meta.url);
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const errors = [];
const warnings = [];

const requiredTimelinePeriods = new Set(plan.timelinePeriods.map((period) => period.id));
const ids = new Set();
const deliverableIds = new Set();
const stepIds = new Set();
const crossDependencyIds = new Set(plan.crossProgrammeDependencies.map((dependency) => dependency.id));

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

plan.projects.forEach((project, projectIndex) => {
  const projectPath = `projects[${projectIndex}]`;
  addId(project.id, projectPath);
  requireField(project, 'title', projectPath);
  requireField(project, 'owner', projectPath);

  if (!Array.isArray(project.deliverables) || project.deliverables.length !== 4) {
    warnings.push(`${project.id} should usually contain exactly four deliverables.`);
  }

  project.deliverables?.forEach((deliverable, deliverableIndex) => {
    const deliverablePath = `${project.id}.deliverables[${deliverableIndex}]`;
    addId(deliverable.id, deliverablePath);
    deliverableIds.add(deliverable.id);
    ['title', 'lead', 'summary', 'problemSolved', 'whatChanges'].forEach((field) => requireField(deliverable, field, deliverablePath));

    if (!Array.isArray(deliverable.components) || deliverable.components.length !== 4) {
      warnings.push(`${deliverable.id} should usually contain exactly four components.`);
    }

    if (!Array.isArray(deliverable.steps) || deliverable.steps.length !== 4) {
      warnings.push(`${deliverable.id} should usually contain exactly four delivery steps.`);
    }

    deliverable.steps?.forEach((step, stepIndex) => {
      const stepPath = `${deliverable.id}.steps[${stepIndex}]`;
      addId(step.id, stepPath);
      stepIds.add(step.id);
      ['title', 'period', 'summary'].forEach((field) => requireField(step, field, stepPath));
      if (step.period && !requiredTimelinePeriods.has(step.period)) {
        errors.push(`${step.id} uses unknown timeline period: ${step.period}`);
      }
    });
  });
});

const validReferenceIds = new Set([...deliverableIds, ...stepIds, ...crossDependencyIds]);

plan.projects.forEach((project) => {
  project.deliverables?.forEach((deliverable) => {
    deliverable.dependencies?.forEach((dependency) => {
      if (!validReferenceIds.has(dependency.targetId)) {
        errors.push(`${deliverable.id} dependency target not found: ${dependency.targetId}`);
      }
    });

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
