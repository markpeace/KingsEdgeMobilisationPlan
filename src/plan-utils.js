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

function textOf(item, fallback = 'Item') {
  if (typeof item === 'string') return item;
  return item?.title || item?.label || item?.item || item?.role || fallback;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normaliseCaseForChange(deliverable) {
  const existing = deliverable.caseForChange || {};
  return {
    problem: existing.problem || deliverable.problemSolved || '',
    opportunity: existing.opportunity || deliverable.opportunity || '',
    whyNow: existing.whyNow || deliverable.whyNow || '',
    intendedChange: existing.intendedChange || deliverable.whatChanges || ''
  };
}

function normaliseOwnership(deliverable, project) {
  const existing = deliverable.ownership || {};
  return {
    accountableOwner: existing.accountableOwner || project.owner || 'TBC',
    deliveryLead: existing.deliveryLead || deliverable.lead || 'TBC',
    benefitOwner: existing.benefitOwner || existing.accountableOwner || project.owner || 'TBC',
    contributors: asArray(existing.contributors),
    decisionForum: existing.decisionForum || 'TBC'
  };
}

function normaliseOutput(deliverable, output, index) {
  return {
    id: output.id || `${deliverable.id}-O${index + 1}`,
    title: textOf(output, 'Output'),
    type: output.type || output.outputType || 'output',
    description: output.description || output.summary || '',
    owner: output.owner || deliverable.lead || 'TBC',
    duePeriod: output.duePeriod || output.due || output.period || 'TBC',
    acceptanceCriteria: asArray(output.acceptanceCriteria),
    supportsBenefits: asArray(output.supportsBenefits),
    status: output.status || 'draft'
  };
}

function normaliseMeasure(deliverable, measure, index) {
  return {
    id: measure.id || `${deliverable.id}-M${index + 1}`,
    title: measure.title || measure.label || 'Measure',
    measureType: measure.measureType || measure.type || 'measure',
    questionAnswered: measure.questionAnswered || '',
    measure: measure.measure || measure.description || '',
    baseline: measure.baseline || '',
    target: measure.target || '',
    dataSource: measure.dataSource || '',
    cadence: measure.cadence || measure.reviewFrequency || measure.period || 'TBC',
    owner: measure.owner || deliverable.lead || 'TBC',
    confidence: measure.confidence || 'developing',
    supportsBenefits: asArray(measure.supportsBenefits || measure.benefitIds)
  };
}

function normaliseBenefit(deliverable, benefit, index) {
  return {
    id: benefit.id || `${deliverable.id}-B${index + 1}`,
    title: textOf(benefit, 'Benefit'),
    beneficiary: benefit.beneficiary || benefit.audience || 'Students / programmes / institution',
    benefitType: benefit.benefitType || benefit.type || 'value',
    statement: benefit.statement || benefit.description || '',
    currentState: benefit.currentState || '',
    desiredChange: benefit.desiredChange || '',
    owner: benefit.owner || deliverable.ownership?.benefitOwner || deliverable.lead || 'TBC',
    realisationPeriod: benefit.realisationPeriod || benefit.period || 'TBC',
    realisedThrough: asArray(benefit.realisedThrough || benefit.outputs),
    measures: asArray(benefit.measures)
  };
}

function normaliseSteps(deliverable) {
  return asArray(deliverable.steps).map((step) => ({
    stepType: step.stepType || 'task',
    outputsProduced: asArray(step.outputsProduced || step.outputIds || asArray(step.outputs).map((output, index) => output.id || `${step.id}-O${index + 1}`)),
    resources: step.resources || {},
    outputs: asArray(step.outputs),
    decisions: asArray(step.decisions),
    risks: asArray(step.risks),
    issues: asArray(step.issues),
    assumptions: asArray(step.assumptions),
    ...step
  }));
}

function normaliseDependencies(deliverable) {
  return asArray(deliverable.dependencies).map((dependency, index) => ({
    id: dependency.id || `${deliverable.id}-DEP${index + 1}`,
    dependsOn: dependency.dependsOn || dependency.targetId || dependency.id,
    targetId: dependency.targetId || dependency.dependsOn || dependency.id,
    dependencyType: dependency.dependencyType || dependency.type || 'dependency',
    criticality: dependency.criticality || 'medium',
    description: dependency.description || dependency.label || '',
    owner: dependency.owner || 'TBC',
    status: dependency.status || 'open'
  }));
}

function fallbackBenefits(deliverable, measures) {
  if (!deliverable.whatChanges) return [];
  return [
    {
      id: `${deliverable.id}-B1`,
      title: 'Intended change realised',
      beneficiary: 'Students / programmes / institution',
      benefitType: 'strategic value',
      statement: deliverable.whatChanges,
      currentState: deliverable.problemSolved || '',
      desiredChange: deliverable.whatChanges,
      owner: deliverable.lead || 'TBC',
      realisationPeriod: 'TBC',
      realisedThrough: [],
      measures: measures.map((measure) => measure.id)
    }
  ];
}

function fallbackDefinitionOfDone(outputs, measures) {
  const criteria = [];
  if (outputs.length) criteria.push('Core outputs are delivered and accepted against agreed criteria.');
  if (measures.length) criteria.push('Measures are agreed, owned and baselined where possible.');
  criteria.push('Dependencies, assumptions and risks are reviewed with the accountable owner.');
  criteria.push('Benefit owner and route to adoption or business-as-usual are confirmed.');
  return criteria;
}

function normaliseDeliverableSchema(deliverable, project) {
  const caseForChange = normaliseCaseForChange(deliverable);
  const ownership = normaliseOwnership(deliverable, project);
  const outputs = asArray(deliverable.outputs || deliverable.successMeasures?.outputs).map((output, index) => normaliseOutput(deliverable, output, index));
  const measures = asArray(deliverable.measures || deliverable.successMeasures?.measures || deliverable.successMeasures?.kpis).map((measure, index) => normaliseMeasure(deliverable, measure, index));
  const rawBenefits = asArray(deliverable.benefits || deliverable.successMeasures?.benefits);
  const benefits = rawBenefits.length ? rawBenefits.map((benefit, index) => normaliseBenefit({ ...deliverable, ownership }, benefit, index)) : fallbackBenefits(deliverable, measures);
  const steps = normaliseSteps(deliverable);

  return {
    ...deliverable,
    caseForChange,
    ownership,
    planningMaturity: deliverable.planningMaturity || 'concept',
    benefits,
    outputs,
    measures,
    deliverySteps: steps,
    steps,
    dependencies: normaliseDependencies(deliverable),
    assumptions: asArray(deliverable.assumptions),
    issues: asArray(deliverable.issues),
    risks: asArray(deliverable.risks),
    decisions: asArray(deliverable.decisions),
    definitionOfDone: asArray(deliverable.definitionOfDone).length ? deliverable.definitionOfDone : fallbackDefinitionOfDone(outputs, measures)
  };
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
      ...normaliseDeliverableSchema(deliverable, project),
      displayId: displayIdForDeliverable(deliverable.id)
    })) || []
  };
}

function compareProjects(a, b) {
  if (a.deliveryContext !== b.deliveryContext) {
    return a.deliveryContext === 'edge' ? -1 : 1;
  }
  return a.displayOrder - b.displayOrder || String(a.displayId || a.id).localeCompare(String(b.displayId || b.id));
}

export const projects = applySchemaExampleContent([
  ...plan.projects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'edge' })),
  ...outOfProgrammeProjects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }))
]).map(enrichProject).sort(compareProjects);

export const edgeProjects = projects.filter((project) => project.deliveryContext === 'edge');

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
