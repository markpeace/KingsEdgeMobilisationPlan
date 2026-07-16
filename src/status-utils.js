import statusData from './data/status.json';

const statusLabels = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  blocked: 'Blocked',
  complete: 'Complete',
  scoping: 'Scoping',
  active: 'In progress'
};

const confidenceLabels = {
  settled: 'Settled',
  'needs-validation': 'Needs validation',
  placeholder: 'Placeholder'
};

export function canonicalDeliveryStatus(value) {
  if (value === 'active') return 'in-progress';
  if (value === 'scoping') return 'not-started';
  return value || 'not-started';
}

export function getStatus(id) {
  const status = {
    ...statusData.defaults,
    ...(statusData.items[id] || {})
  };
  return { ...status, status: canonicalDeliveryStatus(status.status) };
}

export function labelStatus(value) {
  return statusLabels[value] || value;
}

export function labelConfidence(value) {
  return confidenceLabels[value] || value;
}

export function statusClass(value) {
  return `status-${value || 'not-started'}`;
}

export function confidenceClass(value) {
  return `confidence-${value || 'needs-validation'}`;
}

export function deriveDeliverySummary(stepIds) {
  const counts = {
    'not-started': 0,
    'in-progress': 0,
    blocked: 0,
    complete: 0
  };

  stepIds.forEach((id) => {
    const status = getStatus(id).status;
    const canonicalStatus = status === 'active' ? 'in-progress' : status === 'scoping' ? 'not-started' : status;
    if (counts[canonicalStatus] !== undefined) counts[canonicalStatus] += 1;
  });

  const total = stepIds.length;
  const overall = total > 0 && counts.complete === total
    ? 'complete'
    : counts.blocked > 0
      ? 'blocked'
      : counts['in-progress'] > 0 || counts.complete > 0
        ? 'in-progress'
        : 'not-started';

  return { total, counts, overall };
}
