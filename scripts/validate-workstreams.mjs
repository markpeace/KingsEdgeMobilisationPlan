import fs from 'node:fs';

function readJson(path) {
  return JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
}

function readJsonFromUrl(url) {
  return JSON.parse(fs.readFileSync(url, 'utf8'));
}

const plan = readJson('../src/data/kings-edge-plan.json');
const enablingProjects = readJson('../src/data/enabling-projects.json');
const manifest = readJson('../src/data/deliverables/manifest.json');
const partsBaseUrl = new URL('../src/data/deliverables/', import.meta.url);
const errors = [];

function mergeParts(...parts) {
  return parts.reduce((merged, part) => ({
    ...merged,
    ...part,
    caseForChange: { ...(merged.caseForChange || {}), ...(part.caseForChange || {}) },
    ownership: { ...(merged.ownership || {}), ...(part.ownership || {}) },
    resources: part.resources ? { ...(merged.resources || {}), ...part.resources } : merged.resources
  }), {});
}

const registered = manifest.deliverables.map((entry) => {
  const parts = (entry.parts || []).map((path) => readJsonFromUrl(new URL(path, partsBaseUrl)));
  const deliverable = mergeParts(...parts);
  return {
    ...deliverable,
    id: deliverable.id || entry.id,
    projectId: deliverable.projectId || entry.projectId
  };
});

const existingIds = new Set();
for (const project of [...(plan.projects || []), ...(enablingProjects || [])]) {
  if (project.id) existingIds.add(project.id);
  for (const deliverable of project.deliverables || []) {
    if (deliverable.id) existingIds.add(deliverable.id);
    for (const step of deliverable.steps || []) if (step.id) existingIds.add(step.id);
  }
}
for (const deliverable of registered) {
  if (deliverable.id) existingIds.add(deliverable.id);
  for (const step of deliverable.steps || []) if (step.id) existingIds.add(step.id);
}

const workstreamIds = new Set();

function requireText(value, path) {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${path} should be a non-empty string.`);
}

for (const deliverable of registered) {
  if (deliverable.workstreams === undefined) continue;
  if (!Array.isArray(deliverable.workstreams)) {
    errors.push(`${deliverable.id}.workstreams should be an array.`);
    continue;
  }

  const localStepIds = new Set((deliverable.steps || []).map((step) => step.id).filter(Boolean));
  deliverable.workstreams.forEach((workstream, index) => {
    const path = `${deliverable.id}.workstreams[${index}]`;
    if (!workstream || typeof workstream !== 'object' || Array.isArray(workstream)) {
      errors.push(`${path} should be an object.`);
      return;
    }

    requireText(workstream.id, `${path}.id`);
    requireText(workstream.title, `${path}.title`);
    requireText(workstream.summary, `${path}.summary`);
    if (workstream.owner !== undefined) requireText(workstream.owner, `${path}.owner`);

    if (workstream.id) {
      if (existingIds.has(workstream.id)) errors.push(`${path}.id duplicates an existing project, deliverable or step id: ${workstream.id}.`);
      if (workstreamIds.has(workstream.id)) errors.push(`${path}.id duplicates another workstream id: ${workstream.id}.`);
      workstreamIds.add(workstream.id);
    }

    if (workstream.stepIds !== undefined && !Array.isArray(workstream.stepIds)) {
      errors.push(`${path}.stepIds should be an array.`);
      return;
    }

    const seenStepIds = new Set();
    for (const [stepIndex, stepId] of (workstream.stepIds || []).entries()) {
      if (typeof stepId !== 'string' || !stepId.trim()) {
        errors.push(`${path}.stepIds[${stepIndex}] should be a non-empty string.`);
        continue;
      }
      if (seenStepIds.has(stepId)) errors.push(`${path}.stepIds should not contain duplicate step id: ${stepId}.`);
      seenStepIds.add(stepId);
      if (!localStepIds.has(stepId)) errors.push(`${path}.stepIds[${stepIndex}] references a step outside this deliverable or an unknown step: ${stepId}.`);
    }
  });
}

if (errors.length) {
  console.error('Workstream validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Workstream validation passed.');
