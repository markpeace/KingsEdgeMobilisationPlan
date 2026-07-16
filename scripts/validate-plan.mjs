import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

function readJsonFromUrl(url) {
  return JSON.parse(fs.readFileSync(url, 'utf8'));
}

const plan = readJson('../src/data/kings-edge-plan.json');
const deliverableManifest = readJson('../src/data/deliverables/manifest.json');
const outOfProgrammeProjects = readJson('../src/data/enabling-projects.json');
const stepDependencies = readJson('../src/data/step-dependencies.json');
const statusData = readJson('../src/data/status.json');
const measureSchema = readJson('../src/data/measure.schema.json');

const errors = [];
const warnings = [];
const validPlanningStatuses = new Set([
  'pre-draft',
  'proposition-draft',
  'draft',
  'validated-draft',
  'decision-ready',
  'mobilising',
  'in-delivery'
]);
const timelineBucketIdList = ['jul-dec-2026', ...[2027, 2028, 2029, 2030].flatMap((year) => [`jan-jun-${year}`, `jul-dec-${year}`])];
const timelineBucketIds = new Set(timelineBucketIdList);
const timelineThirdIdList = timelineBucketIdList.flatMap((bucket) => ['a', 'b', 'c'].map((third) => `${bucket}-${third}`));
const timelineThirdIds = new Set(timelineThirdIdList);
const timelinePointOrder = new Map(timelineThirdIdList.map((id, index) => [id, index + 1]));
const validThirdSegments = new Set(['a', 'b', 'c', 'ab', 'bc', 'abc']);
const segmentSpans = {
  a: ['a', 'a'],
  b: ['b', 'b'],
  c: ['c', 'c'],
  ab: ['a', 'b'],
  bc: ['b', 'c'],
  abc: ['a', 'c']
};
const legacyTimelineIds = new Set([
  'now-xmas-2026',
  'jan-summer-2027',
  'ay-2027-28-to-2028-29',
  'ay-2029-30',
  'now-sep-2026',
  'oct-2026-mar-2027',
  'apr-sep-2027',
  'oct-2027-mar-2028',
  'apr-sep-2028',
  'oct-2028-mar-2029',
  'apr-sep-2029',
  'oct-2029-mar-2030',
  'apr-sep-2030'
]);
const ids = new Set();
const deliverableIds = new Set();
const stepIds = new Set();
const projectIds = new Set();
const measureIds = new Set();
const ajv = new Ajv2020({ allErrors: true });
const validateMeasureSchema = ajv.compile(measureSchema);

function periodForMessage(period) {
  return typeof period === 'string' ? period : JSON.stringify(period);
}

function parseTimelinePoint(point) {
  if (point && typeof point === 'object') {
    return {
      bucket: point.bucket || point.period || point.id,
      segment: point.segment || point.third || point.part || 'abc'
    };
  }
  const text = String(point || '');
  if (timelineThirdIds.has(text)) {
    const third = text.slice(-1);
    return { bucket: text.slice(0, -2), segment: third, internalPoint: text };
  }
  const [bucket, segment = 'abc'] = text.split(':');
  return { bucket, segment };
}

function resolveTimelinePointIndex(point, edge = 'start') {
  const parsed = parseTimelinePoint(point);
  if (parsed.internalPoint) return timelinePointOrder.get(parsed.internalPoint);
  const segment = String(parsed.segment || 'abc').toLowerCase();
  const [startThird, endThird] = segmentSpans[segment] || segmentSpans.abc;
  const third = edge === 'end' ? endThird : startThird;
  return timelinePointOrder.get(`${parsed.bucket}-${third}`);
}

function validateTimelinePoint(point, path) {
  const parsed = parseTimelinePoint(point);
  const segment = String(parsed.segment || 'abc').toLowerCase();
  if (!timelineBucketIds.has(parsed.bucket)) errors.push(`${path} uses unknown timeline bucket: ${periodForMessage(point)}`);
  if (!validThirdSegments.has(segment)) errors.push(`${path} uses unknown timeline segment: ${segment}`);
}

function validateTimelinePeriod(period, path, { allowLegacy = false } = {}) {
  if (!period) return;
  if (typeof period === 'string' && legacyTimelineIds.has(period)) {
    const message = `${path} uses legacy timeline period: ${period}`;
    if (allowLegacy) warnings.push(message);
    else errors.push(message);
    return;
  }
  if (period && typeof period === 'object' && period.start && period.end) {
    validateTimelinePoint(period.start, `${path}.start`);
    validateTimelinePoint(period.end, `${path}.end`);
    const startIndex = resolveTimelinePointIndex(period.start, 'start');
    const endIndex = resolveTimelinePointIndex(period.end, 'end');
    if (startIndex && endIndex && endIndex < startIndex) errors.push(`${path} has an end before its start: ${periodForMessage(period)}`);
    return;
  }
  validateTimelinePoint(period, path);
}

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

function readDeliverablePart(partPath, deliverableId) {
  try {
    return readJsonFromUrl(new URL(partPath, deliverablePartsBaseUrl));
  } catch (error) {
    errors.push(`Deliverable registry could not read part ${partPath} for ${deliverableId}: ${error.message}`);
    return {};
  }
}

const registeredDeliverables = (deliverableManifest.deliverables || []).map((entry) => {
  const deliverable = mergeDeliverableParts(...(entry.parts || []).map((partPath) => readDeliverablePart(partPath, entry.id)));
  return {
    ...deliverable,
    id: deliverable.id || entry.id,
    projectId: deliverable.projectId || entry.projectId
  };
});
const deliverableOverrides = new Map(registeredDeliverables.map((deliverable) => [deliverable.id, deliverable]));

function applyDeliverableOverrides(project) {
  if (!Array.isArray(project.deliverables)) return project;
  return {
    ...project,
    deliverables: project.deliverables.map((deliverable) => deliverableOverrides.get(deliverable.id) || deliverable)
  };
}

const allProjects = [
  ...plan.projects.map((project) => applyDeliverableOverrides({ ...project, deliveryContext: project.deliveryContext || 'edge' })),
  ...outOfProgrammeProjects.map((project) => ({ ...project, deliveryContext: project.deliveryContext || 'out-of-programme' }))
];

function requireField(object, field, path) {
  if (!object[field]) errors.push(`${path} is missing required field: ${field}`);
}

function addId(id, path) {
  if (!id) {
    errors.push(`${path} is missing an id`);
    return;
  }
  if (ids.has(id)) errors.push(`Duplicate id found: ${id}`);
  ids.add(id);
}

function validateArrayIfPresent(value, path) {
  if (value !== undefined && !Array.isArray(value)) errors.push(`${path} should be an array.`);
}

function validateResources(resources, path, options = {}) {
  if (resources === undefined) return;
  if (!resources || typeof resources !== 'object' || Array.isArray(resources)) {
    errors.push(`${path}.resources should be an object.`);
    return;
  }
  validateArrayIfPresent(resources.people, `${path}.resources.people`);
  validateArrayIfPresent(resources.cashCosts, `${path}.resources.cashCosts`);
  validateArrayIfPresent(resources.nonCashNeeds, `${path}.resources.nonCashNeeds`);
  validateArrayIfPresent(resources.existingCapacity, `${path}.resources.existingCapacity`);
  validateArrayIfPresent(resources.newInvestment, `${path}.resources.newInvestment`);
  validateArrayIfPresent(resources.enablingConditions, `${path}.resources.enablingConditions`);
  resources.people?.forEach((person, index) => {
    if (person.fte !== undefined && typeof person.fte !== 'number') errors.push(`${path}.resources.people[${index}].fte should be a number.`);
  });
  resources.cashCosts?.forEach((cost, index) => {
    if (cost.amount !== undefined && typeof cost.amount !== 'number') errors.push(`${path}.resources.cashCosts[${index}].amount should be a number.`);
    validateTimelinePeriod(cost.period, `${path}.resources.cashCosts[${index}]`, options);
  });
}

function validateSuccessMeasures(successMeasures, path) {
  if (successMeasures === undefined) return;
  if (!successMeasures || typeof successMeasures !== 'object' || Array.isArray(successMeasures)) {
    errors.push(`${path}.successMeasures should be an object.`);
    return;
  }
  validateArrayIfPresent(successMeasures.outputs, `${path}.successMeasures.outputs`);
  validateArrayIfPresent(successMeasures.kpis, `${path}.successMeasures.kpis`);
}

function pathFromSchemaError(error) {
  const instancePath = error.instancePath
    .split('/')
    .filter(Boolean)
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'))
    .reduce((path, segment) => (/^\d+$/.test(segment) ? `${path}[${segment}]` : `${path}.${segment}`), '');

  if (error.keyword === 'required') return `${instancePath}.${error.params.missingProperty}`;
  return instancePath || '';
}

function measureValidationMessage(error) {
  if (error.keyword === 'required') return `is missing required field: ${error.params.missingProperty}`;
  if (error.keyword === 'type') return `should be ${error.params.type}`;
  if (error.keyword === 'minItems') return `should contain at least ${error.params.limit} item`;
  if (error.keyword === 'uniqueItems') return 'should not contain duplicate entries';
  return error.message || 'is invalid';
}

function validateMeasures(measures, deliverable, path) {
  if (measures === undefined) return;
  if (!Array.isArray(measures)) {
    errors.push(`${path}.measures should be an array.`);
    return;
  }

  const benefitIds = new Set((deliverable.benefits || []).map((benefit) => benefit?.id).filter(Boolean));

  measures.forEach((measure, measureIndex) => {
    const measureId = measure?.id;
    const measureLabel = measureId || `measures[${measureIndex}]`;
    const measurePath = `${path}.measures[${measureIndex}]`;

    if (measureId) {
      if (measureIds.has(measureId)) errors.push(`${deliverable.id} ${measureLabel}.id duplicates measure id: ${measureId}`);
      measureIds.add(measureId);
      addId(measureId, `${measurePath}.id`);
    }

    if (!validateMeasureSchema(measure)) {
      validateMeasureSchema.errors.forEach((error) => {
        const propertyPath = pathFromSchemaError(error);
        const fullPath = `${measurePath}${propertyPath}`;
        errors.push(`${deliverable.id} ${measureLabel} ${fullPath}: ${measureValidationMessage(error)}.`);
      });
    }

    if (Array.isArray(measure?.supportsBenefits)) {
      measure.supportsBenefits.forEach((benefitId, benefitIndex) => {
        if (typeof benefitId === 'string' && !benefitIds.has(benefitId)) {
          errors.push(`${deliverable.id} ${measureLabel} ${measurePath}.supportsBenefits[${benefitIndex}]: unknown benefit id: ${benefitId}.`);
        }
      });
    }
  });
}

function validateSteps(steps, ownerPath, options = {}) {
  if (steps === undefined) return;
  if (!Array.isArray(steps)) {
    errors.push(`${ownerPath}.steps should be an array.`);
    return;
  }
  steps.forEach((step, stepIndex) => {
    const stepPath = `${ownerPath}.steps[${stepIndex}]`;
    addId(step.id, stepPath);
    stepIds.add(step.id);
    ['title', 'period', 'summary'].forEach((field) => requireField(step, field, stepPath));
    validateTimelinePeriod(step.period, `${step.id}.period`, options);
    validateArrayIfPresent(step.outputs, `${stepPath}.outputs`);
    validateArrayIfPresent(step.decisions, `${stepPath}.decisions`);
    validateArrayIfPresent(step.risks, `${stepPath}.risks`);
    validateArrayIfPresent(step.issues, `${stepPath}.issues`);
    validateArrayIfPresent(step.assumptions, `${stepPath}.assumptions`);
    validateResources(step.resources, stepPath, options);
  });
}

allProjects.forEach((project, projectIndex) => {
  const projectPath = `projects[${projectIndex}]`;
  addId(project.id, projectPath);
  projectIds.add(project.id);
  requireField(project, 'title', projectPath);
  requireField(project, 'owner', projectPath);
  requireField(project, 'summary', projectPath);
  requireField(project, 'deliveryContext', projectPath);
  if (!['edge', 'out-of-programme'].includes(project.deliveryContext)) errors.push(`${project.id} uses unknown deliveryContext: ${project.deliveryContext}`);
  if (!Array.isArray(project.deliverables)) errors.push(`${project.id} should contain a deliverables array.`);
  project.deliverables?.forEach((deliverable, deliverableIndex) => {
    const deliverablePath = `${project.id}.deliverables[${deliverableIndex}]`;
    const status = deliverable.planningStatus || 'pre-draft';
    const allowLegacyPeriods = ['pre-draft', 'proposition-draft'].includes(status);
    addId(deliverable.id, deliverablePath);
    deliverableIds.add(deliverable.id);
    if (!validPlanningStatuses.has(status)) errors.push(`${deliverable.id} uses unknown planningStatus: ${status}`);
    ['title', 'lead', 'summary', 'problemSolved', 'whatChanges'].forEach((field) => requireField(deliverable, field, deliverablePath));
    validateArrayIfPresent(deliverable.components, `${deliverablePath}.components`);
    validateArrayIfPresent(deliverable.benefits, `${deliverablePath}.benefits`);
    validateArrayIfPresent(deliverable.outputs, `${deliverablePath}.outputs`);
    validateMeasures(deliverable.measures, deliverable, deliverablePath);
    validateArrayIfPresent(deliverable.definitionOfDone, `${deliverablePath}.definitionOfDone`);
    validateArrayIfPresent(deliverable.dependencies, `${deliverablePath}.dependencies`);
    validateArrayIfPresent(deliverable.feedsInto, `${deliverablePath}.feedsInto`);
    validateArrayIfPresent(deliverable.relatedDeliverables, `${deliverablePath}.relatedDeliverables`);
    validateArrayIfPresent(deliverable.assumptions, `${deliverablePath}.assumptions`);
    validateArrayIfPresent(deliverable.issues, `${deliverablePath}.issues`);
    validateArrayIfPresent(deliverable.risks, `${deliverablePath}.risks`);
    validateArrayIfPresent(deliverable.decisions, `${deliverablePath}.decisions`);
    validateSuccessMeasures(deliverable.successMeasures, deliverablePath);
    validateResources(deliverable.resources, deliverablePath, { allowLegacy: allowLegacyPeriods });
    validateSteps(deliverable.steps, deliverable.id, { allowLegacy: allowLegacyPeriods });
  });
});

const validReferenceIds = new Set([...projectIds, ...deliverableIds, ...stepIds]);

allProjects.forEach((project) => {
  project.deliverables?.forEach((deliverable) => {
    deliverable.feedsInto?.forEach((targetId) => {
      if (!validReferenceIds.has(targetId)) errors.push(`${deliverable.id} feedsInto target not found: ${targetId}`);
    });
    deliverable.relatedDeliverables?.forEach((targetId) => {
      if (!validReferenceIds.has(targetId)) errors.push(`${deliverable.id} relatedDeliverables target not found: ${targetId}`);
    });
    deliverable.steps?.forEach((step) => {
      step.dependsOn?.forEach((targetId) => {
        if (!validReferenceIds.has(targetId)) errors.push(`${step.id} dependsOn target not found: ${targetId}`);
      });
    });
  });
  project.servesDeliverables?.forEach((targetId) => {
    if (!validReferenceIds.has(targetId)) errors.push(`${project.id} servesDeliverables target not found: ${targetId}`);
  });
});

Object.entries(stepDependencies).forEach(([stepId, targets]) => {
  if (!stepIds.has(stepId)) errors.push(`step-dependencies key is not a known step id: ${stepId}`);
  targets.forEach((targetId) => {
    if (!stepIds.has(targetId)) errors.push(`${stepId} has unknown step dependency target: ${targetId}`);
  });
});

Object.keys(statusData.items || {}).forEach((itemId) => {
  if (!validReferenceIds.has(itemId)) warnings.push(`status.json contains status for unknown or currently unused id: ${itemId}`);
});

if (warnings.length) {
  console.warn('Plan validation warnings:');
  warnings.forEach((warning) => console.warn(`- ${warning}`));
}
if (errors.length) {
  console.error('Plan validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log('Plan validation passed.');
