import { resourceGroups } from './resource-profile-utils.js';
import { sharedResourceRegistry } from './shared-resource-registry.js';
import {
  sharedResourceLinksFromSteps,
  sharedResourcePlanSummary,
  sharedResourceSummary
} from './shared-resource-utils.js';

export function stepsForResourceContext(context) {
  if (!context?.item) return [];

  if (context.type === 'deliverable') {
    return (context.item.steps || []).map((step) => ({
      ...step,
      contextId: context.item.id,
      contextTitle: context.item.title
    }));
  }

  if (context.type === 'project') {
    return (context.item.deliverables || []).flatMap((deliverable) =>
      (deliverable.steps || []).map((step) => ({
        ...step,
        contextId: deliverable.id,
        contextTitle: deliverable.title
      }))
    );
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
