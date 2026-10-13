import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../src/data/', import.meta.url);
const secondRoot = new URL('./v2/', root);
const read = (base, relative) => JSON.parse(fs.readFileSync(new URL(relative, base), 'utf8'));
const firstPlan = read(root, 'kings-edge-plan.json');
const secondPlan = read(secondRoot, 'kings-edge-plan.json');
const crosswalk = read(secondRoot, 'crosswalk.json');
const baseline = JSON.parse(fs.readFileSync(new URL('../docs/plan-v1-baseline.json', import.meta.url), 'utf8'));

function loadDeliverables(base, plan) {
  const result = new Map(plan.projects.flatMap((project) => project.deliverables.map((item) => [item.id, item])));
  for (const entry of read(base, 'deliverables/manifest.json').deliverables) {
    let merged = {};
    for (const relative of entry.parts) {
      const part = read(base, `deliverables/${relative}`);
      merged = {
        ...merged,
        ...part,
        caseForChange: { ...merged.caseForChange, ...part.caseForChange },
        ownership: { ...merged.ownership, ...part.ownership },
        resources: part.resources
          ? { ...merged.resources, ...part.resources, investmentAsk: { ...merged.resources?.investmentAsk, ...part.resources.investmentAsk } }
          : merged.resources
      };
    }
    result.set(entry.id, merged);
  }
  return result;
}

const original = loadDeliverables(root, firstPlan);
const revised = loadDeliverables(secondRoot, secondPlan);
const originalEdge = new Set(firstPlan.projects.flatMap((project) => project.deliverables.map((item) => item.id)));
const revisedEdge = new Set(secondPlan.projects.flatMap((project) => project.deliverables.map((item) => item.id)));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const canonical = (value) => JSON.stringify(value, (_key, item) => {
  if (!item || Array.isArray(item) || typeof item !== 'object') return item;
  return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
});
const askKinds = ['existingCapacity', 'newInvestment', 'cashCosts', 'people', 'nonCashNeeds', 'enablingConditions'];
const referenceHome = Object.fromEntries(Object.entries(crosswalk.deliverables)
  .map(([id, entry]) => [id, id === '2.4.4' ? 'v2-premium-activation' : entry.v2DeliverableIds[0]]));
const remapReferences = (value) => {
  if (typeof value === 'string') return referenceHome[value] || value;
  if (Array.isArray(value)) return value.map(remapReferences);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, remapReferences(child)]));
  }
  return value;
};
const asks = (deliverables, ids, kind) => ids.flatMap((id) => (deliverables.get(id)?.steps || [])
  .flatMap((step) => step.resources?.[kind] || [])).map(canonical).sort();
const equalMultiset = (left, right) => canonical(left) === canonical(right);

check(firstPlan.projects.length === 4, 'Expected four V1 programme projects.');
check(secondPlan.projects.length === 6, 'Expected six V2 programme projects.');
check(originalEdge.size === 16, 'Expected sixteen V1 programme deliverables.');
check(revisedEdge.size === 19, 'Expected nineteen V2 programme deliverables.');
check(equalMultiset([...originalEdge].sort(), Object.keys(crosswalk.deliverables).sort()), 'Crosswalk does not cover every V1 deliverable.');
check(equalMultiset([...revisedEdge].sort(), Object.values(crosswalk.deliverables).flatMap((entry) => entry.v2DeliverableIds).sort()), 'V2 has an unmapped or duplicate deliverable.');
for (const [id, item] of original) {
  if (!originalEdge.has(id)) check(canonical(item) === canonical(revised.get(id)),
    `Out-of-programme deliverable ${id} changed during the remap.`);
}

const itemDestinations = (oldId, kind, key) => {
  const targetIds = crosswalk.deliverables[oldId]?.v2DeliverableIds || [];
  const source = original.get(oldId)?.[kind] || [];
  for (const item of source) {
    const destinations = crosswalk[key]?.[item.id] || [];
    check(destinations.length === 1, `${oldId} ${kind} ${item.id} needs exactly one V2 home.`);
    check(destinations.every((target) => targetIds.includes(target) &&
      (revised.get(target)?.[kind] || []).some((candidate) => candidate.id === item.id)),
    `${item.id} has a stale V2 destination.`);
  }
};

for (const oldId of originalEdge) {
  const targetIds = crosswalk.deliverables[oldId]?.v2DeliverableIds || [];
  check(targetIds.length > 0, `${oldId} has no destination.`);
  for (const id of targetIds) {
    check(revisedEdge.has(id), `${oldId} points to missing ${id}.`);
    check(revised.get(id)?.legacyIds?.includes(oldId), `${id} has no source provenance.`);
  }
  for (const [kind, key] of [
    ['benefits', 'benefitDestinations'], ['measures', 'measureDestinations'], ['outputs', 'outputDestinations']
  ]) itemDestinations(oldId, kind, key);

  for (const step of original.get(oldId)?.steps || []) {
    const destinations = crosswalk.stepDestinations[step.id] || [];
    check(destinations.length > 0, `${step.id} has no destination.`);
    check(destinations.every((id) => targetIds.includes(id) &&
      (revised.get(id)?.steps || []).some((candidate) =>
        candidate.id === step.id || candidate.sourceStepIds?.includes(step.id))),
    `${step.id} has a stale step destination.`);
    const originalOutputs = (step.outputs || []).map(canonical).sort();
    const revisedOutputs = targetIds.flatMap((id) => (revised.get(id)?.steps || [])
      .filter((candidate) => candidate.id === step.id || candidate.sourceStepIds?.includes(step.id))
      .flatMap((candidate) => candidate.outputs || [])).map(canonical).sort();
    check(equalMultiset(originalOutputs, revisedOutputs), `${step.id} lost or duplicated a step output.`);
  }
  for (const kind of askKinds) {
    check(equalMultiset(asks(original, [oldId], kind), asks(revised, targetIds, kind)),
      `${oldId} ${kind} asks changed or were counted twice.`);
  }
  if (targetIds.length === 1) {
    const source = original.get(oldId);
    const target = revised.get(targetIds[0]);
    for (const [field, value] of Object.entries(source)) {
      if (field === 'id') continue;
      if (oldId === '2.3.3' && field === 'summary') {
        check(target.summary.startsWith(source.summary), 'Deferred subject-society summary lost its source content.');
      } else if (field === 'relatedDeliverables') {
        const expected = remapReferences(value);
        check(expected.every((id) => target[field]?.includes(id)), `${oldId} lost a related-deliverable link.`);
      } else {
        check(canonical(remapReferences(value)) === canonical(target[field]),
          `${oldId} changed source field ${field} outside the two intentional splits.`);
      }
    }
  }
}

for (const id of ['2.2.2', '2.4.4']) {
  const home = id === '2.2.2' ? 'v2-partnership-infrastructure' : 'v2-premium-activation';
  for (const field of ['summary', 'detailSummary', 'problemSolved', 'whatChanges', 'caseForChange']) {
    check(canonical(original.get(id)[field]) === canonical(revised.get(home)?.sourceIntegratedNarrative?.[field]),
      `${id} original ${field} is missing from the integrated source narrative.`);
  }
  for (const target of crosswalk.deliverables[id].v2DeliverableIds) {
    check(canonical(original.get(id).decisionLog) === canonical(revised.get(target)?.decisionLog),
      `${id} decision history missing from ${target}.`);
  }
}

for (const project of firstPlan.projects) {
  const targetIds = crosswalk.projects[project.id]?.v2ProjectIds || [];
  check(targetIds.length > 0 && targetIds.every((id) => secondPlan.projects.some((item) => item.id === id)),
    `${project.id} has an incomplete project crosswalk.`);
}

const oldShared = read(root, 'shared-resources.json').sharedResources;
const newShared = read(secondRoot, 'shared-resources.json').sharedResources;
check(equalMultiset(oldShared.map((item) => item.id).sort(), newShared.map((item) => item.id).sort()),
  'Shared resource inventory changed.');
for (const old of oldShared) {
  const next = newShared.find((item) => item.id === old.id);
  if (!next) continue;
  check(canonical(old.yearlyProfile) === canonical(next.yearlyProfile) &&
    canonical(old.bauLiability) === canonical(next.bauLiability),
  `${old.id} coherent FTE/cash profile or BAU liability changed.`);
  for (const allocation of old.allocationPlan || []) {
    const destination = allocation.deliverableId === '2.4.4'
      ? (old.id === 'edge-analytics-data-capability' ? 'v2-survey-improvement' : 'v2-premium-activation')
      : crosswalk.deliverables[allocation.deliverableId]?.v2DeliverableIds[0];
    const mapped = next.allocationPlan.find((item) => item.deliverableId === destination);
    check(Boolean(mapped) && canonical(mapped.yearlyProfile) === canonical(allocation.yearlyProfile),
      `${old.id} allocation for ${allocation.deliverableId} changed.`);
  }
  check((old.allocationPlan || []).length === (next.allocationPlan || []).length,
    `${old.id} allocation count changed.`);
}

check(canonical(firstPlan) === canonical(read(secondRoot, 'source-snapshot/kings-edge-plan.json')),
  'Exact V1 top-level snapshot changed.');
for (const relative of Object.keys(baseline.files).filter((file) =>
  file.startsWith('deliverables/') && file.endsWith('.json') && file !== 'deliverables/manifest.json')) {
  check(fs.readFileSync(new URL(relative, root)).equals(fs.readFileSync(new URL(relative, secondRoot))),
    `Unregistered V1 source part changed inside V2: ${relative}.`);
}

if (errors.length) {
  console.error('V2 crosswalk validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const stepCount = Object.keys(crosswalk.stepDestinations).length;
const benefitCount = Object.keys(crosswalk.benefitDestinations).length;
const measureCount = Object.keys(crosswalk.measureDestinations).length;
console.log(`V2 crosswalk passed: 4→6 projects, 16→19 deliverables, ${stepCount} source steps, ${benefitCount} benefits, ${measureCount} measures; every step output and resource ask accounted for once.`);
