import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const registryPath = path.join(root, 'src/data/shared-resources.json');
const deliverablesRoot = path.join(root, 'src/data/deliverables');
const topLevelFiles = [
  path.join(root, 'src/data/kings-edge-plan.json'),
  path.join(root, 'src/data/enabling-projects.json')
];

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

const registry = readJson(registryPath);
const resources = Array.isArray(registry.sharedResources) ? registry.sharedResources : [];
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
