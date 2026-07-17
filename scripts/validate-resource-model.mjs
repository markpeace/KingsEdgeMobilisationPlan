import fs from 'node:fs';
import { DEFAULT_PLANNING_STATUS, hasDeliveryDesign } from '../src/planning-status.js';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

function readJsonFromUrl(url) {
  return JSON.parse(fs.readFileSync(url, 'utf8'));
}

const plan = readJson('../src/data/kings-edge-plan.json');
const outOfProgrammeProjects = readJson('../src/data/enabling-projects.json');
const manifest = readJson('../src/data/deliverables/manifest.json');
const errors = [];

function mergeDeliverableParts(...parts) {
  return parts.reduce((merged, part) => {
    const resources = part.resources
      ? {
          ...(merged.resources || {}),
          ...part.resources,
          investmentAsk: {
            ...(merged.resources?.investmentAsk || {}),
            ...(part.resources?.investmentAsk || {})
          }
        }
      : merged.resources;

    return {
      ...merged,
      ...part,
      caseForChange: {
        ...(merged.caseForChange || {}),
        ...(part.caseForChange || {})
      },
      ownership: {
        ...(merged.ownership || {}),
        ...(part.ownership || {})
      },
      resources
    };
  }, {});
}

const deliverablePartsBaseUrl = new URL('../src/data/deliverables/', import.meta.url);
const registeredDeliverables = (manifest.deliverables || []).map((entry) => {
  const parts = (entry.parts || []).map((partPath) => readJsonFromUrl(new URL(partPath, deliverablePartsBaseUrl)));
  const deliverable = mergeDeliverableParts(...parts);
  return {
    ...deliverable,
    id: deliverable.id || entry.id,
    projectId: deliverable.projectId || entry.projectId
  };
});
const registeredMap = new Map(registeredDeliverables.map((deliverable) => [deliverable.id, deliverable]));

const projects = [...(plan.projects || []), ...(outOfProgrammeProjects || [])];
const deliverables = projects.flatMap((project) => (project.deliverables || []).map((deliverable) => registeredMap.get(deliverable.id) || deliverable));

function hasArrayItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasDeliverableResourceContent(resources) {
  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) return false;
  const arrays = [
    'existingCapacity',
    'newInvestment',
    'enablingConditions',
    'people',
    'cashCosts',
    'dataAndSystems',
    'governance',
    'engagementNeeds',
    'nonCashNeeds'
  ];
  return arrays.some((key) => hasArrayItems(resources[key]))
    || Boolean(resources.fundingSummary || resources.resourceSummary)
    || resources.investmentAsk?.required === true;
}

function validateResourceArray(value, path, labelFields) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    errors.push(`${path} should be an array.`);
    return;
  }

  value.forEach((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${path}[${index}] should be an object.`);
      return;
    }
    if (!labelFields.some((field) => item[field])) {
      errors.push(`${path}[${index}] needs one of: ${labelFields.join(', ')}.`);
    }
    if (item.amount !== undefined && typeof item.amount !== 'number') {
      errors.push(`${path}[${index}].amount should be a number.`);
    }
    if (item.fte !== undefined && typeof item.fte !== 'number') {
      errors.push(`${path}[${index}].fte should be a number.`);
    }
  });
}

function validateStepResources(step, deliverableId, stepIndex) {
  if (step.resources === undefined) return;
  const path = `${deliverableId}.steps[${stepIndex}].resources`;
  if (!step.resources || typeof step.resources !== 'object' || Array.isArray(step.resources)) {
    errors.push(`${path} should be an object.`);
    return;
  }

  validateResourceArray(step.resources.existingCapacity, `${path}.existingCapacity`, ['role', 'item', 'team']);
  validateResourceArray(step.resources.newInvestment, `${path}.newInvestment`, ['item', 'role']);
  validateResourceArray(step.resources.enablingConditions, `${path}.enablingConditions`, ['condition', 'need', 'item']);

  // Backwards-compatible aliases remain valid while data is migrated.
  validateResourceArray(step.resources.people, `${path}.people`, ['role', 'item']);
  validateResourceArray(step.resources.cashCosts, `${path}.cashCosts`, ['item']);
  validateResourceArray(step.resources.dataAndSystems, `${path}.dataAndSystems`, ['condition', 'item', 'need']);
  validateResourceArray(step.resources.governance, `${path}.governance`, ['condition', 'item', 'need']);
  validateResourceArray(step.resources.engagementNeeds, `${path}.engagementNeeds`, ['condition', 'item', 'need']);
  validateResourceArray(step.resources.nonCashNeeds, `${path}.nonCashNeeds`, ['condition', 'item', 'need']);
}

deliverables.forEach((deliverable) => {
  const planningStatus = deliverable.planningStatus || DEFAULT_PLANNING_STATUS;
  const hasDeliveryPlan = hasDeliveryDesign(planningStatus);
  if (hasDeliveryPlan && hasDeliverableResourceContent(deliverable.resources)) {
    errors.push(`${deliverable.id} has deliverable-level resource content. Move each ask to the step that needs it; the app derives the resource profile from step resources.`);
  }

  (deliverable.steps || []).forEach((step, stepIndex) => validateStepResources(step, deliverable.id, stepIndex));
});

if (errors.length) {
  console.error('Resource model validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Resource model validation passed.');
