import manifest from './manifest.json';

const localDeliverableParts = import.meta.glob('./**/*.json', { eager: true, import: 'default' });
const legacyDeliverableParts = import.meta.glob('../deliverable-overrides/*.json', { eager: true, import: 'default' });
const deliverableParts = { ...localDeliverableParts, ...legacyDeliverableParts };

export function mergeDeliverableParts(...parts) {
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

function partFor(path, deliverableId) {
  const part = deliverableParts[path];
  if (!part) throw new Error(`Deliverable registry could not find part ${path} for ${deliverableId}`);
  return part;
}

export const registeredDeliverables = manifest.deliverables.map((entry) => {
  const deliverable = mergeDeliverableParts(...entry.parts.map((path) => partFor(path, entry.id)));
  return {
    ...deliverable,
    id: deliverable.id || entry.id,
    projectId: deliverable.projectId || entry.projectId
  };
});

export const registeredDeliverableMap = new Map(registeredDeliverables.map((deliverable) => [deliverable.id, deliverable]));
