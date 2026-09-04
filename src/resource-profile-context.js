import { resourceGroups } from './resource-profile-utils.js';
import { sharedResourceRegistry } from './shared-resource-registry.js';
import {
  sharedResourceLinksFromSteps,
  sharedResourcePlanSummary,
  sharedResourceSummary
} from './shared-resource-utils.js';

function resourceLabelForAsk(ask, fallback) {
  return ask?.label || ask?.item || ask?.role || ask?.condition || ask?.need || fallback;
}

function operatingCostStepsForDeliverable(deliverable) {
  const model = deliverable?.operatingCostModel;
  if (!model) return [];

  const stepId = `${deliverable.id}-operating-cost-model`;
  const withAskType = (ask, askType, index) => ({
    ...ask,
    id: ask.id || `${stepId}-${askType}-${index + 1}`,
    askType,
    label: resourceLabelForAsk(ask, askType === 'new-investment' ? 'Operating investment' : 'Operating condition'),
    stepId,
    periodNeeded: ask.periodNeeded || '2026/27 onward',
    owner: ask.owner || '',
    rationale: ask.rationale || ask.contribution || '',
    riskIfMissing: ask.riskIfMissing || ''
  });

  const newInvestment = (model.newInvestment || []).map((ask, index) => withAskType(ask, 'new-investment', index));
  const existingCapacity = (model.existingCapacity || []).map((ask, index) => withAskType(ask, 'existing-capacity', index));
  const enablingConditions = (model.enablingConditions || []).map((ask, index) => withAskType(ask, 'enabling-condition', index));

  if (!newInvestment.length && !existingCapacity.length && !enablingConditions.length) return [];

  return [{
    id: stepId,
    title: model.title || 'Recurring product operating costs',
    summary: model.summary || '',
    period: model.period || 'jul-dec-2026',
    resources: { existingCapacity, newInvestment, enablingConditions },
    contextId: deliverable.id,
    contextTitle: deliverable.title,
    resourceOnly: true
  }];
}

function resourceStepsForDeliverable(deliverable) {
  const superseded = new Set(deliverable?.supersededResourceAskIds || []);
  const authored = (deliverable?.steps || []).map((step) => ({
    ...step,
    resources: step.resources ? {
      ...step.resources,
      existingCapacity: (step.resources.existingCapacity || []).filter((ask) => !superseded.has(ask.id)),
      newInvestment: (step.resources.newInvestment || []).filter((ask) => !superseded.has(ask.id)),
      enablingConditions: (step.resources.enablingConditions || []).filter((ask) => !superseded.has(ask.id))
    } : step.resources,
    contextId: deliverable.id,
    contextTitle: deliverable.title
  }));

  return [...authored, ...operatingCostStepsForDeliverable(deliverable)];
}

export function stepsForResourceContext(context) {
  if (!context?.item) return [];

  if (context.type === 'deliverable') {
    return resourceStepsForDeliverable(context.item);
  }

  if (context.type === 'project') {
    return (context.item.deliverables || []).flatMap(resourceStepsForDeliverable);
  }

  return [];
}

function deliverableIdsForContext(context) {
  if (!context?.item) return [];
  if (context.type === 'deliverable') return context.item.id ? [context.item.id] : [];
  if (context.type === 'project') return (context.item.deliverables || []).map((deliverable) => deliverable.id).filter(Boolean);
  return [];
}

export function sharedResourcePlansForContext(context) {
  return sharedResourcePlanSummary(sharedResourceRegistry, deliverableIdsForContext(context));
}

export function hasResourceProfileForContext(context) {
  const hasStepResources = stepsForResourceContext(context).some((step) => resourceGroups(step).length > 0);
  return hasStepResources || sharedResourcePlansForContext(context).length > 0;
}

function formatSharedFte(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 3 }).format(number)} FTE`;
}

function formatSharedMoney(value, currency = 'GBP') {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(number);
}

function allocationProfileLabel(resource) {
  const entries = [...(resource.plannedAllocationByYear || new Map()).entries()]
    .filter(([, fte]) => Number(fte) > 0)
    .map(([year, fte]) => `${year}: ${formatSharedFte(fte)}`);
  return entries.length ? `Planned allocation here: ${entries.join('; ')}` : null;
}

function coherentProfileLabel(resource) {
  const entries = (resource.yearlyProfile || []).map((entry) => {
    const fte = formatSharedFte(entry.fte);
    const amount = formatSharedMoney(entry.amount, entry.currency || 'GBP');
    return `${entry.academicYear}: ${[fte, amount].filter(Boolean).join(' / ')}`;
  });
  return entries.length ? `Coherent resource profile: ${entries.join('; ')}` : null;
}

function sharedResourceModelsForContext(context) {
  const links = sharedResourceLinksFromSteps(stepsForResourceContext(context));
  const linked = sharedResourceSummary(sharedResourceRegistry, links);
  const planned = sharedResourcePlansForContext(context);
  const byId = new Map();

  for (const resource of linked) byId.set(resource.id, resource);
  for (const resource of planned) byId.set(resource.id, { ...(byId.get(resource.id) || {}), ...resource });

  return [...byId.values()]
    .filter((resource) => resource.resourceType === 'workforce' || resource.totalFte !== null || resource.allocatedFte > 0)
    .map((resource) => {
      const allocation = resource.allocatedFte > 0 ? formatSharedFte(resource.allocatedFte) : null;
      const total = resource.totalFte !== null && resource.totalFte !== undefined ? formatSharedFte(resource.totalFte) : null;
      const parts = [
        allocationProfileLabel(resource),
        coherentProfileLabel(resource),
        !resource.plannedAllocationByYear && allocation && total ? `${allocation} of the ${total} coherent resource is linked here` : null,
        !resource.plannedAllocationByYear && allocation && !total ? `${allocation} is linked here` : null,
        resource.appointmentBasis ? `Appointment basis: ${resource.appointmentBasis}` : null,
        resource.employmentHome ? `Employment home: ${resource.employmentHome}` : null,
        resource.fundingBasis ? `Funding: ${resource.fundingBasis}` : null,
        resource.bauDestination ? `BAU destination: ${resource.bauDestination}` : null
      ].filter(Boolean);

      return {
        sharedResourceId: resource.id,
        summary: `${resource.title}. ${parts.join('. ')}.`
      };
    });
}

export function workforceModelsForResourceContext(context) {
  if (!context?.item) return [];
  const sharedModels = sharedResourceModelsForContext(context);
  if (context.type === 'deliverable') {
    return [
      ...(context.item.workforceModel ? [context.item.workforceModel] : []),
      ...sharedModels
    ];
  }
  if (context.type === 'project') {
    return [
      ...(context.item.deliverables || [])
        .map((deliverable) => deliverable.workforceModel)
        .filter(Boolean),
      ...sharedModels
    ];
  }
  return [];
}

export function deliverableForResourceAsk(context, ask) {
  if (!context?.item) return null;
  if (context.type === 'deliverable') return context.item;
  if (context.type !== 'project') return null;
  return (context.item.deliverables || []).find((deliverable) =>
    deliverable.id === ask?.sourceStep?.contextId
  ) || null;
}
