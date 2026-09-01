export function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function sharedResourceLinksFromSteps(steps = []) {
  const links = [];

  for (const step of asArray(steps)) {
    const groups = [
      ['existing-capacity', step.resources?.existingCapacity],
      ['new-investment', step.resources?.newInvestment]
    ];

    for (const [askType, items] of groups) {
      for (const ask of asArray(items)) {
        if (!ask?.sharedResourceId) continue;
        links.push({
          sharedResourceId: ask.sharedResourceId,
          sharedResourceAllocation: ask.sharedResourceAllocation || null,
          askType,
          stepId: step.id || null,
          stepTitle: step.title || null,
          ask
        });
      }
    }
  }

  return links;
}

export function groupSharedResourceLinks(links = []) {
  const grouped = new Map();

  for (const link of asArray(links)) {
    if (!link?.sharedResourceId) continue;
    if (!grouped.has(link.sharedResourceId)) grouped.set(link.sharedResourceId, []);
    grouped.get(link.sharedResourceId).push(link);
  }

  return grouped;
}

export function sharedResourceAllocationFte(links = []) {
  return asArray(links).reduce((sum, link) => {
    const value = Number(link?.sharedResourceAllocation?.fte);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

export function sharedResourceById(registry = {}, id) {
  return asArray(registry?.sharedResources).find((resource) => resource?.id === id) || null;
}

export function sharedResourceSummary(registry = {}, links = []) {
  const grouped = groupSharedResourceLinks(links);

  return [...grouped.entries()].map(([id, resourceLinks]) => {
    const resource = sharedResourceById(registry, id);
    return {
      id,
      title: resource?.title || id,
      summary: resource?.summary || '',
      resourceType: resource?.resourceType || '',
      totalFte: Number.isFinite(Number(resource?.totalFte)) ? Number(resource.totalFte) : null,
      appointmentBasis: resource?.appointmentBasis || '',
      employmentHome: resource?.employmentHome || '',
      fundingBasis: resource?.fundingBasis || '',
      bauDestination: resource?.bauDestination || '',
      yearlyProfile: asArray(resource?.yearlyProfile),
      bauLiability: resource?.bauLiability || null,
      allocatedFte: sharedResourceAllocationFte(resourceLinks),
      links: resourceLinks
    };
  });
}

export function sharedResourcePlannedAllocations(resource = {}, deliverableIds = []) {
  const ids = new Set(asArray(deliverableIds));
  return asArray(resource?.allocationPlan).filter((allocation) => ids.has(allocation?.deliverableId));
}

export function sumFteByAcademicYear(profiles = []) {
  const totals = new Map();
  for (const profile of asArray(profiles)) {
    for (const entry of asArray(profile?.yearlyProfile)) {
      const fte = Number(entry?.fte);
      if (!entry?.academicYear || !Number.isFinite(fte)) continue;
      totals.set(entry.academicYear, (totals.get(entry.academicYear) || 0) + fte);
    }
  }
  return totals;
}

export function sharedResourcePlanSummary(registry = {}, deliverableIds = []) {
  return asArray(registry?.sharedResources).flatMap((resource) => {
    const allocations = sharedResourcePlannedAllocations(resource, deliverableIds);
    if (!allocations.length) return [];
    return [{
      id: resource.id,
      title: resource.title || resource.id,
      summary: resource.summary || '',
      resourceType: resource.resourceType || '',
      totalFte: Number.isFinite(Number(resource.totalFte)) ? Number(resource.totalFte) : null,
      appointmentBasis: resource.appointmentBasis || '',
      employmentHome: resource.employmentHome || '',
      fundingBasis: resource.fundingBasis || '',
      bauDestination: resource.bauDestination || '',
      yearlyProfile: asArray(resource.yearlyProfile),
      bauLiability: resource.bauLiability || null,
      plannedAllocationByYear: sumFteByAcademicYear(allocations),
      allocations
    }];
  });
}
