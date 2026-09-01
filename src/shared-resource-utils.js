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
      fundingBasis: resource?.fundingBasis || '',
      bauDestination: resource?.bauDestination || '',
      allocatedFte: sharedResourceAllocationFte(resourceLinks),
      links: resourceLinks
    };
  });
}
