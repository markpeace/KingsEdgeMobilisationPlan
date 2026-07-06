import plan from './data/kings-edge-plan.json';
import outOfProgrammeProjects from './data/enabling-projects.json';
import stepDependencyOverrides from './data/step-dependencies.json';

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
  'now-xmas-2026': { start: 'now-sep-2026', end: 'now-sep-2026', label: 'Now-Sep 2026' },
  'jan-summer-2027': { start: 'oct-2026-mar-2027', end: 'apr-sep-2027', label: 'Oct 2026-Sep 2027' },
  'ay-2027-28-to-2028-29': { start: 'oct-2027-mar-2028', end: 'apr-sep-2029', label: 'Oct 2027-Sep 2029' },
  'ay-2029-30': { start: 'oct-2029-mar-2030', end: 'apr-sep-2030', label: 'Oct 2029-Sep 2030' }
};

const asArray = (value) => Array.isArray(value) ? value : [];
const textOf = (item, fallback = 'Item') => typeof item === 'string' ? item : item?.title || item?.label || item?.item || item?.role || item?.condition || fallback;
const withVisibility = (item, fallback = 'internal-planning') => ({ ...item, visibility: item?.visibility || fallback });
const detailSummaryOf = (item) => item.detailSummary || item.description || item.longSummary || '';

function normaliseResources(resources = {}) {
  const existingCapacity = asArray(resources.existingCapacity).length ? resources.existingCapacity : asArray(resources.people).map((item) => ({ role: item.role, contribution: item.notes || item.contribution || '', ...item }));
  const newInvestment = asArray(resources.newInvestment).length ? resources.newInvestment : asArray(resources.cashCosts).map((item) => ({ item: item.item, rationale: item.notes || item.rationale || '', currency: item.currency || 'GBP', ...item }));
  const enablingConditions = asArray(resources.enablingConditions).length ? resources.enablingConditions : [
    ...asArray(resources.dataAndSystems),
    ...asArray(resources.governance),
    ...asArray(resources.engagementNeeds),
    ...asArray(resources.nonCashNeeds)
  ].map((item) => ({ condition: item.condition || item.item || textOf(item, 'Enabling condition'), ...item }));

  return {
    ...resources,
    existingCapacity,
    newInvestment,
    enablingConditions,
    fundingSummary: resources.fundingSummary || resources.resourceSummary || '',
    investmentAsk: resources.investmentAsk || { required: newInvestment.length > 0, fundingRoute: newInvestment.length ? 'TBC' : 'None identified at this stage' }
  };
}

function normaliseDeliverable(deliverable, project) {
  const caseForChange = deliverable.caseForChange || {
    problem: deliverable.problemSolved || '',
    opportunity: deliverable.opportunity || '',
    whyNow: deliverable.whyNow || '',
    intendedChange: deliverable.whatChanges || ''
  };
  const ownership = deliverable.ownership || {
    accountableOwner: project.owner || 'TBC',
    deliveryLead: deliverable.lead || 'TBC',
    benefitOwner: project.owner || 'TBC',
    contributors: [],
    decisionForum: 'TBC'
  };
  const measures = asArray(deliverable.measures || deliverable.successMeasures?.measures || deliverable.successMeasures?.kpis).map((measure, index) => ({ id: measure.id || `${deliverable.id}-M${index + 1}`, title: measure.title || measure.label || 'Measure', measureType: measure.measureType || measure.type || 'measure', confidence: measure.confidence || 'developing', ...measure }));
  const outputs = asArray(deliverable.outputs || deliverable.successMeasures?.outputs).map((output, index) => ({ id: output.id || `${deliverable.id}-O${index + 1}`, title: textOf(output, 'Output'), type: output.type || output.outputType || 'output', ...output }));
  const benefits = asArray(deliverable.benefits || deliverable.successMeasures?.benefits).length ? asArray(deliverable.benefits || deliverable.successMeasures?.benefits) : deliverable.whatChanges ? [{ id: `${deliverable.id}-B1`, title: 'Intended change realised', statement: deliverable.whatChanges, beneficiary: 'Students / programmes / institution', benefitType: 'strategic value' }] : [];
  const steps = asArray(deliverable.steps).map((step) => ({ ...step, stepType: step.stepType || 'task', resources: normaliseResources(step.resources || {}), outputs: asArray(step.outputs), decisions: asArray(step.decisions), risks: asArray(step.risks), issues: asArray(step.issues), assumptions: asArray(step.assumptions) }));
  const definitionOfDone = asArray(deliverable.definitionOfDone).length ? deliverable.definitionOfDone : ['Dependencies, assumptions and risks are reviewed with the accountable owner.', 'Benefit owner and route to adoption or business-as-usual are confirmed.'];

  return {
    ...deliverable,
    displayId: deliverable.id,
    detailSummary: detailSummaryOf(deliverable),
    planningStatus: deliverable.planningStatus || 'pre-draft',
    planningMaturity: deliverable.planningMaturity || 'concept',
    visibility: deliverable.visibility || 'staff-visible',
    caseForChange,
    ownership,
    benefits,
    outputs,
    measures,
    steps,
    deliverySteps: steps,
    resources: normaliseResources(deliverable.resources || {}),
    dependencies: asArray(deliverable.dependencies),
    assumptions: asArray(deliverable.assumptions).map(withVisibility),
    issues: asArray(deliverable.issues).map(withVisibility),
    risks: asArray(deliverable.risks).map(withVisibility),
    decisions: asArray(deliverable.decisions).map(withVisibility),
    definitionOfDone
  };
}

function enrichProject(project, displayOrder) {
  return {
    ...project,
    displayId: project.id,
    displayOrder,
    detailSummary: detailSummaryOf(project),
    transformationClaim: project.transformationClaim || '',
    deliverables: asArray(project.deliverables).map((deliverable) => normaliseDeliverable(deliverable, project))
  };
}

export const projects = [
  ...plan.projects.map((project, index) => enrichProject({ ...project, deliveryContext: project.deliveryContext || 'edge' }, index)),
  ...outOfProgrammeProjects.map((project, index) => enrichProject({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }, 1000 + index))
].sort((a, b) => a.displayOrder - b.displayOrder || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

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
      deliverable.steps?.forEach((step) => idMap.set(step.id, { type: 'step', item: step, parent: enriched }));
    });
  });
  return { deliverables, timelineItems, idMap };
}

export function buildDependencyIndex(timelineItems) {
  const reverse = new Map();
  timelineItems.forEach((item) => {
    item.steps?.forEach((step) => {
      getStepDependencies(step).forEach((targetId) => {
        if (!reverse.has(targetId)) reverse.set(targetId, []);
        reverse.get(targetId).push({ parent: item, step, label: step.summary });
      });
    });
  });
  return reverse;
}

export function getStepPeriodSpan(periodId) {
  const span = broadPeriodSpans[periodId] || { start: periodId, end: periodId, label: periodId };
  const startIndex = timelinePeriodIndex.get(span.start) || 1;
  const endIndex = timelinePeriodIndex.get(span.end) || startIndex;
  return { ...span, startIndex, endIndex, span: Math.max(1, endIndex - startIndex + 1) };
}

export function resolveLabel(id, idMap) {
  const result = idMap.get(id);
  if (!result) return id;
  if (result.type === 'project') return `${result.item.id} ${result.item.title}`;
  if (result.type === 'deliverable') return `${result.item.id} ${result.item.title}`;
  if (result.type === 'step') return `${result.parent.id}: ${result.item.title}`;
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
