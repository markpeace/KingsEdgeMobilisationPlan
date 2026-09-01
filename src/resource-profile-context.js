import { resourceGroups } from './resource-profile-utils.js';
import { sharedResourceRegistry } from './shared-resource-registry.js';
import {
  sharedResourceLinksFromSteps,
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

export function hasResourceProfileForContext(context) {
  return stepsForResourceContext(context).some((step) => resourceGroups(step).length > 0);
}

function formatSharedFte(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 3 }).format(number)} FTE`;
}

function sharedResourceModelsForContext(context) {
  const links = sharedResourceLinksFromSteps(stepsForResourceContext(context));
  return sharedResourceSummary(sharedResourceRegistry, links)
    .filter((resource) => resource.resourceType === 'workforce' || resource.totalFte !== null || resource.allocatedFte > 0)
    .map((resource) => {
      const allocation = resource.allocatedFte > 0 ? formatSharedFte(resource.allocatedFte) : null;
      const total = resource.totalFte !== null ? formatSharedFte(resource.totalFte) : null;
      const parts = [
        allocation && total ? `${allocation} of the ${total} coherent resource is allocated here` : allocation ? `${allocation} is allocated here` : total ? `Part of a ${total} coherent resource` : 'Shared across more than one deliverable',
        resource.appointmentBasis ? `Appointment basis: ${resource.appointmentBasis}` : null,
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
