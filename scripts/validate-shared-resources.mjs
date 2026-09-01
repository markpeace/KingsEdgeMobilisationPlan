import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root, 'src/data/shared-resources.json');
const deliverablesRoot = path.join(root, 'src/data/deliverables');
const planPath = path.join(root, 'src/data/kings-edge-plan.json');
const enablingPath = path.join(root, 'src/data/enabling-projects.json');
const manifestPath = path.join(root, 'src/data/deliverables/manifest.json');
const topLevelFiles = [planPath, enablingPath];
const tolerance = 0.001;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function jsonFilesUnder(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFilesUnder(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

function collectLinks(value, source, pointer = '$', links = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectLinks(item, source, `${pointer}[${index}]`, links));
    return links;
  }
  if (!value || typeof value !== 'object') return links;

  if (typeof value.sharedResourceId === 'string') {
    links.push({ source, pointer, ask: value });
  }

  for (const [key, child] of Object.entries(value)) {
    collectLinks(child, source, `${pointer}.${key}`, links);
  }
  return links;
}

function knownDeliverableIds() {
  const plan = readJson(planPath);
  const enabling = readJson(enablingPath);
  const manifest = readJson(manifestPath);
  const ids = new Set();
  for (const project of [...(plan.projects || []), ...(enabling || [])]) {
    for (const deliverable of project.deliverables || []) {
      if (deliverable?.id) ids.add(deliverable.id);
    }
  }
  for (const entry of manifest.deliverables || []) {
    if (entry?.id) ids.add(entry.id);
  }
  return ids;
}

function validateYearlyProfile(profile, label, errors, { allowAmount = true } = {}) {
  if (profile === undefined) return new Map();
  if (!Array.isArray(profile)) {
    errors.push(`${label} must be an array.`);
    return new Map();
  }

  const byYear = new Map();
  for (const [index, entry] of profile.entries()) {
    const pathLabel = `${label}[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${pathLabel} must be an object.`);
      continue;
    }
    if (!entry.academicYear || typeof entry.academicYear !== 'string') {
      errors.push(`${pathLabel}.academicYear is required.`);
      continue;
    }
    if (!Number.isFinite(entry.fte) || entry.fte < 0) {
      errors.push(`${pathLabel}.fte must be a non-negative number.`);
      continue;
    }
    if (byYear.has(entry.academicYear)) {
      errors.push(`${label} contains duplicate academic year '${entry.academicYear}'.`);
    }
    if (allowAmount && entry.amount !== undefined && (!Number.isFinite(entry.amount) || entry.amount < 0)) {
      errors.push(`${pathLabel}.amount must be a non-negative number when supplied.`);
    }
    if (allowAmount && entry.amount !== undefined && (!entry.currency || typeof entry.currency !== 'string')) {
      errors.push(`${pathLabel}.currency is required when amount is supplied.`);
    }
    byYear.set(entry.academicYear, entry.fte);
  }
  return byYear;
}

const registry = readJson(registryPath);
const resources = Array.isArray(registry.sharedResources) ? registry.sharedResources : [];
const deliverableIds = knownDeliverableIds();
const ids = new Set();
const errors = [];

for (const [index, resource] of resources.entries()) {
  const label = `sharedResources[${index}]`;
  if (!resource || typeof resource !== 'object' || Array.isArray(resource)) {
    errors.push(`${label} must be an object.`);
    continue;
  }
  if (!resource.id || typeof resource.id !== 'string') errors.push(`${label}.id is required.`);
  if (!resource.title || typeof resource.title !== 'string') errors.push(`${label}.title is required.`);
  if (resource.id && ids.has(resource.id)) errors.push(`Duplicate shared resource id: ${resource.id}`);
  if (resource.id) ids.add(resource.id);
  if (resource.totalFte !== undefined && (!Number.isFinite(resource.totalFte) || resource.totalFte < 0)) {
    errors.push(`${label}.totalFte must be a non-negative number.`);
  }

  const coherentByYear = validateYearlyProfile(resource.yearlyProfile, `${label}.yearlyProfile`, errors);
  if (resource.totalFte !== undefined && coherentByYear.size) {
    const peak = Math.max(...coherentByYear.values());
    if (Math.abs(peak - resource.totalFte) > tolerance) {
      errors.push(`${label}.totalFte (${resource.totalFte}) should equal the peak yearly FTE (${peak}).`);
    }
  }

  const allocations = resource.allocationPlan;
  if (allocations !== undefined && !Array.isArray(allocations)) {
    errors.push(`${label}.allocationPlan must be an array.`);
    continue;
  }

  const allocatedByYear = new Map();
  const allocatedDeliverables = new Set();
  for (const [allocationIndex, allocation] of (allocations || []).entries()) {
    const allocationLabel = `${label}.allocationPlan[${allocationIndex}]`;
    if (!allocation || typeof allocation !== 'object' || Array.isArray(allocation)) {
      errors.push(`${allocationLabel} must be an object.`);
      continue;
    }
    if (!allocation.deliverableId || typeof allocation.deliverableId !== 'string') {
      errors.push(`${allocationLabel}.deliverableId is required.`);
      continue;
    }
    if (!deliverableIds.has(allocation.deliverableId)) {
      errors.push(`${allocationLabel} references unknown deliverable '${allocation.deliverableId}'.`);
    }
    if (allocatedDeliverables.has(allocation.deliverableId)) {
      errors.push(`${label}.allocationPlan contains duplicate deliverable '${allocation.deliverableId}'.`);
    }
    allocatedDeliverables.add(allocation.deliverableId);

    const allocationYears = validateYearlyProfile(allocation.yearlyProfile, `${allocationLabel}.yearlyProfile`, errors, { allowAmount: false });
    for (const [year, fte] of allocationYears.entries()) {
      allocatedByYear.set(year, (allocatedByYear.get(year) || 0) + fte);
    }
  }

  for (const [year, coherentFte] of coherentByYear.entries()) {
    const allocatedFte = allocatedByYear.get(year) || 0;
    if (Math.abs(coherentFte - allocatedFte) > tolerance) {
      errors.push(`${label} allocations total ${allocatedFte} FTE in ${year}; coherent resource profile requires ${coherentFte} FTE.`);
    }
  }
  for (const [year, allocatedFte] of allocatedByYear.entries()) {
    if (!coherentByYear.has(year) && allocatedFte > tolerance) {
      errors.push(`${label} allocates ${allocatedFte} FTE in ${year} without a matching coherent yearlyProfile entry.`);
    }
  }

  if (resource.bauLiability !== undefined) {
    const bau = resource.bauLiability;
    if (!bau || typeof bau !== 'object' || Array.isArray(bau)) {
      errors.push(`${label}.bauLiability must be an object.`);
    } else {
      if (bau.fte !== undefined && (!Number.isFinite(bau.fte) || bau.fte < 0)) errors.push(`${label}.bauLiability.fte must be non-negative.`);
      if (bau.annualAmount !== undefined && (!Number.isFinite(bau.annualAmount) || bau.annualAmount < 0)) errors.push(`${label}.bauLiability.annualAmount must be non-negative.`);
      if (bau.annualAmount !== undefined && (!bau.currency || typeof bau.currency !== 'string')) errors.push(`${label}.bauLiability.currency is required when annualAmount is supplied.`);
    }
  }
}

const files = [...topLevelFiles, ...jsonFilesUnder(deliverablesRoot)].filter((file) => fs.existsSync(file));
const links = files.flatMap((file) => collectLinks(readJson(file), path.relative(root, file)));

for (const { source, pointer, ask } of links) {
  if (!ids.has(ask.sharedResourceId)) {
    errors.push(`${source} ${pointer} references unknown shared resource '${ask.sharedResourceId}'.`);
  }
  if (ask.sharedResourceAllocation !== undefined) {
    const allocation = ask.sharedResourceAllocation;
    if (!allocation || typeof allocation !== 'object' || Array.isArray(allocation)) {
      errors.push(`${source} ${pointer}.sharedResourceAllocation must be an object.`);
    } else if (allocation.fte !== undefined && (!Number.isFinite(allocation.fte) || allocation.fte < 0)) {
      errors.push(`${source} ${pointer}.sharedResourceAllocation.fte must be a non-negative number.`);
    }
  }
}

if (errors.length) {
  console.error('Shared resource validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Shared resource validation passed: ${resources.length} registered resource(s), ${links.length} linked ask(s).`);
