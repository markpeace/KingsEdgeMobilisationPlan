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

const edgeDisplayTitles = {
  '2.4': "Articulating and Evidencing The King's Graduate Premium",
  '2.1': 'Curriculum Embedded Graduate Advantage',
  '2.2': 'Co-Curricular Opportunity to Go Further',
  '2.3': 'Extra Curricular Provision for Belonging and Participation'
};

export const timelinePeriods = [
  { id: 'now-sep-2026', label: 'Now to September 2026', shortLabel: 'Now-Sep 26', order: 1 },
  { id: 'oct-2026-mar-2027', label: 'October 2026 to March 2027', shortLabel: 'Oct 26-Mar 27', order: 2 },
  { id: 'apr-sep-2027', label: 'April to September 2027', shortLabel: 'Apr-Sep 27', order: 3 },
  { id: 'oct-2027-mar-2028', label: 'October 2027 to March 2028', shortLabel: 'Oct 27-Mar 28', order: 4 },
  { id: 'apr-sep-2028', label: 'April to September 2028', shortLabel: 'Apr-Sep 28', order: 5 },
  { id: 'oct-2028-mar-2029', label: 'October 2028 to March 2029', shortLabel: 'Oct 28-Mar 29', order: 6 },
  { id: 'apr-sep-2029', label: 'April to September 2029', shortLabel: 'Apr-Sep 29', order: 7 },
  { id: 'oct-2029-mar-2030', label: 'October 2029 to March 2030', shortLabel: 'Oct 29-Mar 30', order: 8 },
  { id: 'apr-sep-2030', label: 'April to September 2030', shortLabel: 'Apr-Sep 30', order: 9 }
];

const timelinePeriodIndex = new Map(timelinePeriods.map((period, index) => [period.id, index + 1]));

const broadPeriodSpans = {
  'now-xmas-2026': {
    start: 'now-sep-2026',
    end: 'now-sep-2026',
    label: 'Now-Sep 2026'
  },
  'jan-summer-2027': {
    start: 'oct-2026-mar-2027',
    end: 'apr-sep-2027',
    label: 'Oct 2026-Sep 2027'
  },
  'ay-2027-28-to-2028-29': {
    start: 'oct-2027-mar-2028',
    end: 'apr-sep-2029',
    label: 'Oct 2027-Sep 2029'
  },
  'ay-2029-30': {
    start: 'oct-2029-mar-2030',
    end: 'apr-sep-2030',
    label: 'Oct 2029-Sep 2030'
  }
};

function mergeObject(base = {}, extra = {}) {
  return { ...base, ...extra };
}

function displayIdForProject(projectId) {
  return edgeDisplayIds[projectId] || projectId;
}

function displayTitleForProject(project) {
  return edgeDisplayTitles[project.id] || project.title;
}

function displayIdForDeliverable(deliverableId) {
  const parts = deliverableId.split('.');
  if (parts.length < 3) return deliverableId;
  const projectId = `${parts[0]}.${parts[1]}`;
  const displayProjectId = displayIdForProject(projectId);
  if (displayProjectId === projectId) return deliverableId;
  return [displayProjectId, ...parts.slice(2)].join('.');
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
    title: displayTitleForProject(project),
    sourceTitle: project.title,
    displayId: displayIdForProject(project.id),
    displayOrder: edgeDisplayOrder.has(project.id) ? edgeDisplayOrder.get(project.id) : 1000,
    deliverables: project.deliverables?.map((deliverable) => ({
      ...deliverable,
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

export function getStepPeriodSpan(periodId) {
  const span = broadPeriodSpans[periodId] || { start: periodId, end: periodId, label: periodId };
  const startIndex = timelinePeriodIndex.get(span.start) || 1;
  const endIndex = timelinePeriodIndex.get(span.end) || startIndex;
  return {
    ...span,
    startIndex,
    endIndex,
    span: Math.max(1, endIndex - startIndex + 1)
  };
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
  return broadPeriodSpans[periodId]?.label || plan.timelinePeriods.find((period) => period.id === periodId)?.shortLabel || periodId;
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
