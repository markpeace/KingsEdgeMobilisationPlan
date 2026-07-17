import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PLANNING_STATUS,
  PLANNING_STATUS_VALUES,
  planningStatusLabel,
  isVisibleInDeliverablesIndex,
  hasDeliveryDesign,
  usesStepDeliveryTracking
} from '../src/planning-status.js';

test('planning stages use the agreed order and labels', () => {
  assert.equal(DEFAULT_PLANNING_STATUS, 'proposition-development');
  assert.deepEqual(PLANNING_STATUS_VALUES, [
    'proposition-development',
    'proposition-review',
    'delivery-design',
    'resource-planning',
    'plan-validation',
    'portfolio-board-approval',
    'resource-confirmation',
    'approved-to-mobilise'
  ]);
  assert.equal(planningStatusLabel('portfolio-board-approval'), 'For Board approval');
});

test('progressive disclosure follows the deliverable gates', () => {
  assert.equal(isVisibleInDeliverablesIndex('proposition-development'), false);
  assert.equal(isVisibleInDeliverablesIndex('proposition-review'), true);
  assert.equal(hasDeliveryDesign('proposition-review'), false);
  assert.equal(hasDeliveryDesign('delivery-design'), true);
});

test('operational tracking begins only after approval to mobilise', () => {
  assert.equal(usesStepDeliveryTracking('resource-confirmation'), false);
  assert.equal(usesStepDeliveryTracking('approved-to-mobilise'), true);
});
