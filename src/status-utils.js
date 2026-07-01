import statusData from './data/status.json';

const statusLabels = {
  'not-started': 'Not started',
  scoping: 'Scoping',
  active: 'Active',
  blocked: 'Blocked',
  complete: 'Complete'
};

const confidenceLabels = {
  settled: 'Settled',
  'needs-validation': 'Needs validation',
  placeholder: 'Placeholder'
};

export function getStatus(id) {
  return {
    ...statusData.defaults,
    ...(statusData.items[id] || {})
  };
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
