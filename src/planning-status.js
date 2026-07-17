export const DEFAULT_PLANNING_STATUS = 'proposition-development';

export const PLANNING_STAGES = [
  {
    value: 'proposition-development',
    label: 'Proposition development',
    description: 'The proposition is being shaped: the need, intended change, benefits, scope and likely ownership are still being clarified.',
    nextGate: 'Proposition ready for informal stakeholder sense-check.'
  },
  {
    value: 'proposition-review',
    label: 'Proposition review',
    description: 'The proposition is ready for a light-touch sense-check with the owner, likely delivery lead and selected senior or key stakeholders.',
    nextGate: 'Informal feedback supports moving into delivery design, with any material points recorded in the log.'
  },
  {
    value: 'delivery-design',
    label: 'Delivery design',
    description: 'The delivery route is being designed without resource constraints: outputs, steps, sequencing, dependencies, benefits and measures are being connected.',
    nextGate: 'Delivery route is coherent enough to resource.'
  },
  {
    value: 'resource-planning',
    label: 'Resource planning',
    description: 'The roles, capacity, investment and enabling conditions needed by the delivery route are being defined.',
    nextGate: 'Resource requirement is complete and explicit.'
  },
  {
    value: 'plan-validation',
    label: 'Plan validation',
    description: 'The full route and resource requirement are being tested with the people who will own, lead, enable and depend on the work.',
    nextGate: 'The plan is supported, material feedback is addressed and it is ready for Portfolio Board.'
  },
  {
    value: 'portfolio-board-approval',
    label: 'For Board approval',
    description: 'The Portfolio Board is being asked to approve the proposition, benefits, delivery route, resource requirement, risks and stated conditions.',
    nextGate: 'Portfolio Board approves the deliverable, with any conditions recorded.'
  },
  {
    value: 'resource-confirmation',
    label: 'Resource confirmation',
    description: 'Board approval is in place. Capacity, investment and enabling conditions are now being authorised and the plan is being reconciled with what is available.',
    nextGate: 'Resources are confirmed and ambition, scope, pace and benefits are aligned to them.'
  },
  {
    value: 'approved-to-mobilise',
    label: 'Approved to mobilise',
    description: 'The deliverable has an approved, resource-backed and achievable plan. Operational progress is now tracked against its delivery steps.',
    nextGate: null
  }
];

export const PLANNING_STATUS_VALUES = PLANNING_STAGES.map((stage) => stage.value);
export const PLANNING_STATUS_SET = new Set(PLANNING_STATUS_VALUES);

const planningStageByValue = new Map(PLANNING_STAGES.map((stage, index) => [stage.value, { ...stage, index }]));

export function planningStatusOf(itemOrStatus) {
  const value = typeof itemOrStatus === 'string' ? itemOrStatus : itemOrStatus?.planningStatus;
  return PLANNING_STATUS_SET.has(value) ? value : DEFAULT_PLANNING_STATUS;
}

export function planningStageFor(itemOrStatus) {
  return planningStageByValue.get(planningStatusOf(itemOrStatus));
}

export function planningStatusLabel(itemOrStatus) {
  return planningStageFor(itemOrStatus).label;
}

export function planningStageAtLeast(itemOrStatus, minimumStatus) {
  return planningStageFor(itemOrStatus).index >= planningStageFor(minimumStatus).index;
}

export function isVisibleInDeliverablesIndex(itemOrStatus) {
  return planningStageAtLeast(itemOrStatus, 'proposition-review');
}

export function hasDeliveryDesign(itemOrStatus) {
  return planningStageAtLeast(itemOrStatus, 'delivery-design');
}

export function usesStepDeliveryTracking(itemOrStatus) {
  return planningStatusOf(itemOrStatus) === 'approved-to-mobilise';
}
