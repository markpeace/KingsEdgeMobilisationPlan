const asArray = (value) => Array.isArray(value) ? value : [];

export function workstreamsOf(deliverable) {
  return asArray(deliverable?.workstreams);
}

export function workstreamMap(deliverable) {
  return new Map(workstreamsOf(deliverable).map((workstream) => [workstream.id, workstream]));
}

export function workstreamsForStep(deliverable, step) {
  if (!step?.id) return [];
  return workstreamsOf(deliverable).filter((workstream) => asArray(workstream.stepIds).includes(step.id));
}

export function stepTitlesForWorkstream(deliverable, workstream) {
  const stepIds = new Set(asArray(workstream?.stepIds));
  return asArray(deliverable?.steps).filter((step) => stepIds.has(step.id)).map((step) => step.title);
}
