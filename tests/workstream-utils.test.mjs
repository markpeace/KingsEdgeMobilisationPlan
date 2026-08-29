import test from 'node:test';
import assert from 'node:assert/strict';
import {
  workstreamsOf,
  workstreamMap,
  workstreamsForStep,
  stepTitlesForWorkstream
} from '../src/workstream-utils.js';

test('deliverables without workstreams remain valid and return an empty collection', () => {
  assert.deepEqual(workstreamsOf({ id: 'x' }), []);
  assert.equal(workstreamMap({ id: 'x' }).size, 0);
});

test('a step can participate in several parallel workstreams', () => {
  const deliverable = {
    workstreams: [
      { id: 'ws-a', title: 'A', stepIds: ['step-1', 'step-2'] },
      { id: 'ws-b', title: 'B', stepIds: ['step-2'] }
    ]
  };
  assert.deepEqual(workstreamsForStep(deliverable, { id: 'step-2' }).map((item) => item.id), ['ws-a', 'ws-b']);
});

test('workstreams can span several chronological steps without becoming timeline nodes', () => {
  const deliverable = {
    steps: [
      { id: 'step-1', title: 'Discover' },
      { id: 'step-2', title: 'Build' },
      { id: 'step-3', title: 'Launch' }
    ]
  };
  const workstream = { id: 'ws-a', title: 'Student experience', stepIds: ['step-1', 'step-3'] };
  assert.deepEqual(stepTitlesForWorkstream(deliverable, workstream), ['Discover', 'Launch']);
});
