import plan from './data/kings-edge-plan.json';
import outOfProgrammeProjects from './data/enabling-projects.json';
import stepDependencyOverrides from './data/step-dependencies.json';
import schemaExampleContent from './data/schema-example-content.json';

const edgeDisplayOrder = new Map([
  ['2.4', 0],
  ['2.1', 1],
  ['2.2', 2],
  ['2.3', 3]
]);

const edgeDisplayIds = {
  '2.4': '2.1',
  '2.1': '2.2',
  '2.2': '2.3',
  '2.3': '2.4'
};

function mergeObject(base = {}, extra = {}) {
  return { ...base, ...extra };
}

function displayIdForProject(projectId) {
  return edgeDisplayIds[projectId] || projectId;
}

function displayIdForDeliverable(deliverableId) {
  const parts = deliverableId.split('.');
  if (parts.length < 3) return deliverableId;
  const projectId = `${parts[0]}.${parts[1]}`;
  const displayProjectId = displayIdForProject(projectId);
  if (displayProjectId === projectId) return deliverableId;
  return [displayProjectId, ...parts.slice(2)].join('.');
}

function normaliseLead(lead) {
  return lead === 'Dan Robson' ? 'Daniel Robson' : lead;
}

function applySchemaExampleContent(projectList) {
  const deliverableExtras = schemaExampleContent.deliverables || {};
  const stepExtras = schemaExampleContent.steps || {};

  return projectList.map((project) => ({
    ...project,
    deliverables: project.deliverables?.map((deliverable) => ({
      ...mergeObject(deliverable, deliverableExtras[deliverable.id]),
      steps: deliverable.steps?.map((step) => mergeObject(step, stepExtras[step.id])) || []
    })) || []
  }));
}

function enrichProject(project) {
  return {
    ...project,
    displayId: displayIdForProject(project.id),
    displayOrder: edgeDisplayOrder.has(project.id) ? edgeDisplayOrder.get(project.id) : 1000,
    deliverables: project.deliverables?.map((deliverable) => ({
      ...deliverable,
      lead: normaliseLead(deliverable.lead),
      displayId: displayIdForDeliverable(deliverable.id)
    })) || []
  };
}

export const projects = applySchemaExampleContent([
  ...plan.projects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'edge' })),
  ...outOfProgrammeProjects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }))
]).map(enrichProject);

export const edgeProjects = projects
  .filter((project) => project.deliveryContext === 'edge')
  .sort((a, b) => a.displayOrder - b.displayOrder || a.id.localeCompare(b.id));

export const outOfProgramme = projects.filter((project) => project.deliveryContext === 'out-of-programme');

export { plan, outOfProgrammeProjects as enablingProjects };

export function getStepDependencies(step) {
  return stepDependencyOverrides[step.id] || step.dependsOn || [];
}

export function buildLookups(projectList = projects) {
  const deliverables = [];
  const timelineItems = [];
  const idMap = new Map();

  projectList.forEach((project) => {
    idMap.set(project.id, { type: 'project', item: project });
    project.deliverables?.forEach((deliverable) => {
      const enriched = { ...deliverable, project, itemType: 'deliverable', ownerLabel: `Lead: ${deliverable.lead}` };
      deliverables.push(enriched);
      timelineItems.push(enriched);
      idMap.set(deliverable.id, { type: 'deliverable', item: enriched });
      deliverable.steps?.forEach((step) => {
        idMap.set(step.id, { type: 'step', item: step, parent: enriched });
      });
    });
  });

  return { deliverables, timelineItems, idMap };
}

export function buildDependencyIndex(timelineItems) {
  const reverse = new Map();
  const addReverse = (targetId, source) => {
    if (!reverse.has(targetId)) reverse.set(targetId, []);
    reverse.get(targetId).push(source);
  };

  timelineItems.forEach((item) => {
    item.steps?.forEach((step) => {
      getStepDependencies(step).forEach((targetId) => {
        addReverse(targetId, { parent: item, step, label: step.summary });
      });
    });
  });

  return reverse;
}

export function resolveLabel(id, idMap) {
  const result = idMap.get(id);
  if (!result) return id;
  if (result.type === 'project') return `${result.item.displayId || result.item.id} ${result.item.title}`;
  if (result.type === 'deliverable') return `${result.item.displayId || result.item.id} ${result.item.title}`;
  if (result.type === 'step') return `${result.parent.displayId || result.parent.id}: ${result.item.title}`;
  return id;
}

export function periodLabel(periodId) {
  return plan.timelinePeriods.find((period) => period.id === periodId)?.shortLabel || periodId;
}

export function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = typeof item === 'string' ? item : `${item.parent?.id}-${item.step?.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
