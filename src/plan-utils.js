import plan from './data/kings-edge-plan.json';
import outOfProgrammeProjects from './data/enabling-projects.json';
import stepDependencyOverrides from './data/step-dependencies.json';
import graduateFutures211 from './data/deliverable-overrides/2.1.1.json';
import graduateFutures211Overview from './data/deliverable-overrides/2.1.1-overview-patch.json';
import graduateFutures211OutputsMeasures from './data/deliverable-overrides/2.1.1-outputs-measures-patch.json';
import graduateFutures211Steps from './data/deliverable-overrides/2.1.1-steps-patch.json';

const thirdSegments = [
  { id: 'a', label: 'a', longLabel: 'first third' },
  { id: 'b', label: 'b', longLabel: 'middle third' },
  { id: 'c', label: 'c', longLabel: 'final third' }
];

const halfYearBuckets = [
  { id: 'jul-dec-2026', label: 'July to December 2026', shortLabel: 'Jul-Dec 26', order: 1 },
  ...[2027, 2028, 2029, 2030].flatMap((year, index) => [
    { id: `jan-jun-${year}`, label: `January to June ${year}`, shortLabel: `Jan-Jun ${String(year).slice(2)}`, order: index * 2 + 2 },
    { id: `jul-dec-${year}`, label: `July to December ${year}`, shortLabel: `Jul-Dec ${String(year).slice(2)}`, order: index * 2 + 3 }
  ])
];

export const timelineBuckets = halfYearBuckets;

export const timelinePeriods = halfYearBuckets.flatMap((bucket) => thirdSegments.map((third, thirdIndex) => ({
  id: `${bucket.id}-${third.id}`,
  bucketId: bucket.id,
  bucketLabel: bucket.label,
  label: `${bucket.label}, ${third.longLabel}`,
  shortLabel: thirdIndex === 0 ? bucket.shortLabel : third.label,
  order: ((bucket.order - 1) * thirdSegments.length) + thirdIndex + 1,
  bucketOrder: bucket.order,
  third: third.id,
  thirdOrder: thirdIndex + 1
})));

const canonicalPlan = { ...plan, timelinePeriods: halfYearBuckets };
const timelinePeriodIndex = new Map(timelinePeriods.map((period, index) => [period.id, index + 1]));
const timelineBucketMap = new Map(halfYearBuckets.map((bucket) => [bucket.id, bucket]));

const broadPeriodSpans = {
  'now-xmas-2026': { start: 'jul-dec-2026-a', end: 'jul-dec-2026-c', label: 'July to December 2026' },
  'jan-summer-2027': { start: 'jan-jun-2027-a', end: 'jul-dec-2027-b', label: 'January to September 2027' },
  'ay-2027-28-to-2028-29': { start: 'jul-dec-2027-b', end: 'jul-dec-2029-b', label: 'September 2027 to September 2029' },
  'ay-2029-30': { start: 'jul-dec-2029-b', end: 'jul-dec-2030-b', label: 'September 2029 to September 2030' },
  'now-sep-2026': { start: 'jul-dec-2026-a', end: 'jul-dec-2026-b', label: 'July to September 2026' },
  'oct-2026-mar-2027': { start: 'jul-dec-2026-b', end: 'jan-jun-2027-b', label: 'October 2026 to March 2027' },
  'apr-sep-2027': { start: 'jan-jun-2027-b', end: 'jul-dec-2027-b', label: 'April to September 2027' },
  'oct-2027-mar-2028': { start: 'jul-dec-2027-b', end: 'jan-jun-2028-b', label: 'October 2027 to March 2028' },
  'apr-sep-2028': { start: 'jan-jun-2028-b', end: 'jul-dec-2028-b', label: 'April to September 2028' },
  'oct-2028-mar-2029': { start: 'jul-dec-2028-b', end: 'jan-jun-2029-b', label: 'October 2028 to March 2029' },
  'apr-sep-2029': { start: 'jan-jun-2029-b', end: 'jul-dec-2029-b', label: 'April to September 2029' },
  'oct-2029-mar-2030': { start: 'jul-dec-2029-b', end: 'jan-jun-2030-b', label: 'October 2029 to March 2030' },
  'apr-sep-2030': { start: 'jan-jun-2030-b', end: 'jul-dec-2030-b', label: 'April to September 2030' }
};

const segmentSpans = {
  a: ['a', 'a'],
  b: ['b', 'b'],
  c: ['c', 'c'],
  ab: ['a', 'b'],
  bc: ['b', 'c'],
  abc: ['a', 'c']
};

function parsePeriod(period) {
  if (period && typeof period === 'object') {
    return {
      bucket: period.bucket || period.period || period.id,
      segment: period.segment || period.third || period.part || 'abc'
    };
  }
  const [bucket, segment = 'abc'] = String(period || '').split(':');
  return { bucket, segment };
}

function resolveTimelinePoint(point, edge = 'start') {
  if (timelinePeriodIndex.has(point)) return point;
  const { bucket, segment } = parsePeriod(point);
  if (timelinePeriodIndex.has(bucket)) return bucket;
  const [startThird, endThird] = segmentSpans[String(segment || 'abc').toLowerCase()] || segmentSpans.abc;
  const third = edge === 'end' ? endThird : startThird;
  return `${bucket}-${third}`;
}

function labelForTimelinePoint(point) {
  if (timelinePeriodIndex.has(point)) {
    const periodEntry = timelinePeriods.find((entry) => entry.id === point);
    return periodEntry?.bucketLabel || periodEntry?.label || point;
  }
  const { bucket } = parsePeriod(point);
  return timelineBucketMap.get(bucket)?.label || timelinePeriods.find((entry) => entry.id === bucket)?.bucketLabel || bucket;
}

function resolveTimelineSpan(period) {
  if (broadPeriodSpans[period]) return broadPeriodSpans[period];
  if (period && typeof period === 'object' && period.start && period.end) {
    const start = resolveTimelinePoint(period.start, 'start');
    const end = resolveTimelinePoint(period.end, 'end');
    const startLabel = labelForTimelinePoint(period.start);
    const endLabel = labelForTimelinePoint(period.end);
    return { start, end, label: startLabel === endLabel ? startLabel : `${startLabel} to ${endLabel}` };
  }
  const { bucket, segment } = parsePeriod(period);
  if (timelinePeriodIndex.has(bucket)) {
    const periodEntry = timelinePeriods.find((entry) => entry.id === bucket);
    return { start: bucket, end: bucket, label: periodEntry?.bucketLabel || periodEntry?.label || bucket };
  }
  if (!timelineBucketMap.has(bucket)) return { start: bucket, end: bucket, label: bucket };
  const [startThird, endThird] = segmentSpans[String(segment || 'abc').toLowerCase()] || segmentSpans.abc;
  const bucketEntry = timelineBucketMap.get(bucket);
  return {
    start: `${bucket}-${startThird}`,
    end: `${bucket}-${endThird}`,
    label: bucketEntry.label,
    bucket,
    segment: String(segment || 'abc').toLowerCase()
  };
}

function mergeDeliverableOverride(...overrides) {
  return overrides.reduce((merged, override) => {
    const resources = override.resources
      ? {
          ...(merged.resources || {}),
          ...override.resources,
          investmentAsk: {
            ...(merged.resources?.investmentAsk || {}),
            ...(override.resources?.investmentAsk || {})
          }
        }
      : merged.resources;
    return {
      ...merged,
      ...override,
      caseForChange: {
        ...(merged.caseForChange || {}),
        ...(override.caseForChange || {})
      },
      ownership: {
        ...(merged.ownership || {}),
        ...(override.ownership || {})
      },
      resources
    };
  }, {});
}

const graduateFutures211Merged = mergeDeliverableOverride(
  graduateFutures211,
  graduateFutures211Overview,
  graduateFutures211OutputsMeasures,
  graduateFutures211Steps
);
const deliverableOverrides = new Map([[graduateFutures211Merged.id, graduateFutures211Merged]]);

const asArray = (value) => Array.isArray(value) ? value : [];
const textOf = (item, fallback = 'Item') => typeof item === 'string' ? item : item?.title || item?.label || item?.item || item?.role || item?.condition || fallback;
const withVisibility = (item, fallback = 'internal-planning') => ({ ...item, visibility: item?.visibility || fallback });
const summaryOf = (item) => item.summary || item.shortDescription || '';
const detailSummaryOf = (item) => item.detailSummary || item.longDescription || item.description || item.longSummary || '';

function deliverableWithOverride(deliverable) {
  return deliverableOverrides.get(deliverable.id) || deliverable;
}

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
    summary: summaryOf(deliverable),
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
    summary: summaryOf(project),
    detailSummary: detailSummaryOf(project),
    transformationClaim: project.transformationClaim || '',
    deliverables: asArray(project.deliverables).map((deliverable) => normaliseDeliverable(deliverableWithOverride(deliverable), project))
  };
}

export const projects = [
  ...canonicalPlan.projects.map((project, index) => enrichProject({ ...project, deliveryContext: project.deliveryContext || 'edge' }, index)),
  ...outOfProgrammeProjects.map((project, index) => enrichProject({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }, 1000 + index))
].sort((a, b) => a.displayOrder - b.displayOrder || String(a.id).localeCompare(String(b.id), undefined, { numeric: true }));

export const edgeProjects = projects.filter((project) => project.deliveryContext === 'edge');
export const outOfProgramme = projects.filter((project) => project.deliveryContext === 'out-of-programme');
export { canonicalPlan as plan, outOfProgrammeProjects as enablingProjects };

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
  const span = resolveTimelineSpan(periodId);
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
  return resolveTimelineSpan(periodId).label || periodId;
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
