import { resourceGroups } from './resource-profile-utils.js';

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

export function workforceModelsForResourceContext(context) {
  if (!context?.item) return [];
  if (context.type === 'deliverable') {
    return context.item.workforceModel ? [context.item.workforceModel] : [];
  }
  if (context.type === 'project') {
    return (context.item.deliverables || [])
      .map((deliverable) => deliverable.workforceModel)
      .filter(Boolean);
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
