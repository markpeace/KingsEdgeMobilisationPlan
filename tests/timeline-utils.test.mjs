import test from 'node:test';
import assert from 'node:assert/strict';
import {
  allocateStepLanes,
  buildBucketGroups,
  calculateVisibleHorizon,
  clipSpanToHorizon,
  findTodayPosition,
  formatSegmentLabel
} from '../src/timeline-utils.js';

const periods = [
  { id: 'jul-dec-2026-a', bucketId: 'jul-dec-2026', bucketLabel: 'July to December 2026' },
  { id: 'jul-dec-2026-b', bucketId: 'jul-dec-2026', bucketLabel: 'July to December 2026' },
  { id: 'jul-dec-2026-c', bucketId: 'jul-dec-2026', bucketLabel: 'July to December 2026' },
  { id: 'jan-jun-2027-a', bucketId: 'jan-jun-2027', bucketLabel: 'January to June 2027' },
  { id: 'jan-jun-2027-b', bucketId: 'jan-jun-2027', bucketLabel: 'January to June 2027' },
  { id: 'jan-jun-2027-c', bucketId: 'jan-jun-2027', bucketLabel: 'January to June 2027' }
];

test('fit horizon adds one segment of padding', () => {
  const horizon = calculateVisibleHorizon(periods, [{ startIndex: 2, endIndex: 5 }], 'fit');
  assert.equal(horizon.startIndex, 1);
  assert.equal(horizon.endIndex, 6);
});

test('full horizon returns every period', () => {
  const horizon = calculateVisibleHorizon(periods, [], 'full');
  assert.equal(horizon.periods.length, periods.length);
});

test('clips a step to the visible horizon', () => {
  assert.deepEqual(
    clipSpanToHorizon({ startIndex: 1, endIndex: 4 }, { startIndex: 2, endIndex: 5 }),
    { startIndex: 2, endIndex: 4, relativeStart: 1, span: 3, clippedStart: true, clippedEnd: false }
  );
});

test('allocates overlapping steps to stable lanes', () => {
  const result = allocateStepLanes([
    { id: 'a', startIndex: 1, endIndex: 2 },
    { id: 'b', startIndex: 2, endIndex: 3 },
    { id: 'c', startIndex: 3, endIndex: 4 }
  ]);
  assert.equal(result.laneCount, 2);
  assert.equal(result.laneById.a, 0);
  assert.equal(result.laneById.b, 1);
  assert.equal(result.laneById.c, 0);
});

test('builds semantic half-year header groups', () => {
  const groups = buildBucketGroups(periods);
  assert.deepEqual(groups.map(({ id, count }) => ({ id, count })), [
    { id: 'jul-dec-2026', count: 3 },
    { id: 'jan-jun-2027', count: 3 }
  ]);
});

test('formats readable segment labels and positions today', () => {
  assert.equal(formatSegmentLabel(periods[0]), 'Jul-Aug');
  const today = new Date(Date.UTC(2026, 6, 15));
  const position = findTodayPosition(periods, today);
  assert.equal(position.index, 1);
  assert.ok(position.percentage > 0);
});
