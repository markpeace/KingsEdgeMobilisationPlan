const segmentMonthRanges = {
  'jan-jun': {
    a: { startMonth: 0, endMonth: 2, label: 'Jan-Feb' },
    b: { startMonth: 2, endMonth: 4, label: 'Mar-Apr' },
    c: { startMonth: 4, endMonth: 6, label: 'May-Jun' }
  },
  'jul-dec': {
    a: { startMonth: 6, endMonth: 8, label: 'Jul-Aug' },
    b: { startMonth: 8, endMonth: 10, label: 'Sep-Oct' },
    c: { startMonth: 10, endMonth: 12, label: 'Nov-Dec' }
  }
};

export function periodBounds(periodId) {
  const match = String(periodId || '').match(/^(jan-jun|jul-dec)-(\d{4})-([abc])$/);
  if (!match) return null;
  const [, bucket, yearText, segment] = match;
  const range = segmentMonthRanges[bucket]?.[segment];
  if (!range) return null;
  const year = Number(yearText);
  return {
    start: new Date(Date.UTC(year, range.startMonth, 1)),
    end: new Date(Date.UTC(year, range.endMonth, 1)),
    label: range.label
  };
}

export function formatSegmentLabel(period) {
  return periodBounds(period?.id)?.label || period?.shortLabel || period?.label || '';
}

export function buildBucketGroups(periods) {
  const groups = [];
  periods.forEach((period, index) => {
    const previous = groups.at(-1);
    if (previous?.id === period.bucketId) {
      previous.count += 1;
      return;
    }
    groups.push({
      id: period.bucketId,
      label: period.bucketLabel,
      shortLabel: period.bucketLabel,
      start: index + 1,
      count: 1
    });
  });
  return groups;
}

export function findTodayPosition(periods, today = new Date()) {
  const timestamp = today.getTime();
  for (let index = 0; index < periods.length; index += 1) {
    const bounds = periodBounds(periods[index].id);
    if (!bounds) continue;
    const start = bounds.start.getTime();
    const end = bounds.end.getTime();
    if (timestamp >= start && timestamp < end) {
      const fraction = Math.max(0, Math.min(1, (timestamp - start) / (end - start)));
      return {
        index: index + 1,
        fraction,
        percentage: ((index + fraction) / periods.length) * 100
      };
    }
  }
  return null;
}

export function calculateVisibleHorizon(periods, spans, mode = 'fit', today = new Date()) {
  const periodCount = periods.length;
  if (!periodCount) return { startIndex: 1, endIndex: 0, periods: [] };

  if (mode === 'full') {
    return { startIndex: 1, endIndex: periodCount, periods: [...periods] };
  }

  if (mode === 'next-18-months') {
    const todayPosition = findTodayPosition(periods, today);
    const startIndex = todayPosition?.index || 1;
    const endIndex = Math.min(periodCount, startIndex + 8);
    return { startIndex, endIndex, periods: periods.slice(startIndex - 1, endIndex) };
  }

  const validSpans = spans.filter((span) => Number.isFinite(span?.startIndex) && Number.isFinite(span?.endIndex));
  if (!validSpans.length) {
    const endIndex = Math.min(periodCount, 9);
    return { startIndex: 1, endIndex, periods: periods.slice(0, endIndex) };
  }

  const first = Math.min(...validSpans.map((span) => span.startIndex));
  const last = Math.max(...validSpans.map((span) => span.endIndex));
  const startIndex = Math.max(1, first - 1);
  const endIndex = Math.min(periodCount, last + 1);
  return { startIndex, endIndex, periods: periods.slice(startIndex - 1, endIndex) };
}

export function clipSpanToHorizon(span, horizon) {
  if (!span || span.endIndex < horizon.startIndex || span.startIndex > horizon.endIndex) return null;
  const startIndex = Math.max(span.startIndex, horizon.startIndex);
  const endIndex = Math.min(span.endIndex, horizon.endIndex);
  return {
    startIndex,
    endIndex,
    relativeStart: startIndex - horizon.startIndex + 1,
    span: endIndex - startIndex + 1,
    clippedStart: span.startIndex < horizon.startIndex,
    clippedEnd: span.endIndex > horizon.endIndex
  };
}

function dependencyDepth(entryId, entryById, memo, visiting = new Set()) {
  if (memo.has(entryId)) return memo.get(entryId);
  if (visiting.has(entryId)) return 0;

  const entry = entryById.get(entryId);
  if (!entry) return 0;

  visiting.add(entryId);
  const depths = (entry.dependencyIds || [])
    .filter((dependencyId) => entryById.has(dependencyId))
    .map((dependencyId) => dependencyDepth(dependencyId, entryById, memo, visiting) + 1);
  visiting.delete(entryId);

  const depth = depths.length ? Math.max(...depths) : 0;
  memo.set(entryId, depth);
  return depth;
}

function preferredDependencyLane(entry, availableLanes, laneById, entryById, depthById) {
  const available = new Set(availableLanes);
  const laneScores = new Map();

  (entry.dependencyIds || []).forEach((dependencyId) => {
    const lane = laneById[dependencyId];
    if (!available.has(lane)) return;

    const dependency = entryById.get(dependencyId);
    if (!dependency) return;

    const score = laneScores.get(lane) || {
      lane,
      latestEnd: Number.NEGATIVE_INFINITY,
      deepestDependency: Number.NEGATIVE_INFINITY,
      dependencyCount: 0
    };
    score.latestEnd = Math.max(score.latestEnd, dependency.endIndex);
    score.deepestDependency = Math.max(score.deepestDependency, depthById.get(dependencyId) || 0);
    score.dependencyCount += 1;
    laneScores.set(lane, score);
  });

  return [...laneScores.values()]
    .sort((a, b) => (
      b.latestEnd - a.latestEnd
      || b.deepestDependency - a.deepestDependency
      || b.dependencyCount - a.dependencyCount
      || a.lane - b.lane
    ))[0]?.lane;
}

export function allocateStepLanes(entries) {
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));
  const depthMemo = new Map();
  const depthById = new Map(entries.map((entry) => [entry.id, dependencyDepth(entry.id, entryById, depthMemo)]));
  const sorted = [...entries].sort((a, b) => (
    a.startIndex - b.startIndex
    || a.endIndex - b.endIndex
    || (a.sourceOrder ?? Number.MAX_SAFE_INTEGER) - (b.sourceOrder ?? Number.MAX_SAFE_INTEGER)
    || String(a.id).localeCompare(String(b.id))
  ));
  const laneEnds = [];
  const laneById = {};

  sorted.forEach((entry) => {
    const availableLanes = laneEnds
      .map((endIndex, lane) => ({ endIndex, lane }))
      .filter(({ endIndex }) => endIndex < entry.startIndex)
      .map(({ lane }) => lane);

    let lane;
    if (availableLanes.length) {
      lane = preferredDependencyLane(entry, availableLanes, laneById, entryById, depthById);
      if (lane === undefined) lane = availableLanes[0];
    } else {
      lane = laneEnds.length;
    }

    laneEnds[lane] = entry.endIndex;
    laneById[entry.id] = lane;
  });

  return { laneById, laneCount: Math.max(1, laneEnds.length) };
}
