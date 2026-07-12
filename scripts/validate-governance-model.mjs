import fs from 'node:fs';

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
  return parts.reduce((merged, part) => ({
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
    governance: {
      ...(merged.governance || {}),
      ...(part.governance || {})
    }
  }), {});
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

function requireText(value, path) {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${path} should be a non-empty string.`);
}

function validateGovernance(deliverable) {
  const planningStatus = deliverable.planningStatus || 'pre-draft';
  if (planningStatus === 'pre-draft') return;

  const path = deliverable.id;
  const governance = deliverable.governance;
  if (!governance || typeof governance !== 'object' || Array.isArray(governance)) {
    errors.push(`${path}.governance should be an object for a draft-or-later deliverable.`);
    return;
  }

  requireText(governance.decisionForum, `${path}.governance.decisionForum`);
  requireText(governance.decisionScope, `${path}.governance.decisionScope`);
  requireText(governance.businessAsUsualOwner, `${path}.governance.businessAsUsualOwner`);

  if (governance.deliveryPartners !== undefined && !Array.isArray(governance.deliveryPartners)) {
    errors.push(`${path}.governance.deliveryPartners should be an array.`);
  }

  (governance.deliveryPartners || []).forEach((group, index) => {
    const groupPath = `${path}.governance.deliveryPartners[${index}]`;
    if (!group || typeof group !== 'object' || Array.isArray(group)) {
      errors.push(`${groupPath} should be an object.`);
      return;
    }
    requireText(group.group, `${groupPath}.group`);
    requireText(group.contribution, `${groupPath}.contribution`);
    if (group.partners !== undefined && !Array.isArray(group.partners)) {
      errors.push(`${groupPath}.partners should be an array.`);
    }
  });

  (deliverable.benefits || []).forEach((benefit, index) => {
    requireText(benefit.owner, `${path}.benefits[${index}].owner`);
  });

  if (deliverable.ownership?.benefitOwner) {
    errors.push(`${path}.ownership.benefitOwner is legacy. Put ownership on each benefit.`);
  }
  if (Array.isArray(deliverable.ownership?.contributors) && deliverable.ownership.contributors.length) {
    errors.push(`${path}.ownership.contributors is legacy. Group essential partners under governance.deliveryPartners.`);
  }
  if (deliverable.ownership?.decisionForum) {
    errors.push(`${path}.ownership.decisionForum is legacy. Use governance.decisionForum.`);
  }
}

deliverables.forEach(validateGovernance);

if (errors.length) {
  console.error('Governance model validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Governance model validation passed.');
