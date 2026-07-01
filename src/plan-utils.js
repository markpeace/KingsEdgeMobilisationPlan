import plan from './data/kings-edge-plan.json';
import enablingProjects from './data/enabling-projects.json';
import stepDependencyOverrides from './data/step-dependencies.json';

export { plan, enablingProjects };

export function getStepDependencies(step) {
  return stepDependencyOverrides[step.id] || step.dependsOn || [];
}

export function buildLookups(projects = plan.projects, enabling = enablingProjects) {
  const deliverables = [];
  const timelineItems = [];
  const idMap = new Map();

  projects.forEach((project) => {
    project.deliverables.forEach((deliverable) => {
      const enriched = { ...deliverable, project, itemType: 'deliverable', ownerLabel: `Lead: ${deliverable.lead}` };
      deliverables.push(enriched);
      timelineItems.push(enriched);
      idMap.set(deliverable.id, { type: 'deliverable', item: enriched });
      deliverable.steps.forEach((step) => {
        idMap.set(step.id, { type: 'step', item: step, parent: enriched });
      });
    });
  });

  enabling.forEach((project) => {
    const enriched = { ...project, itemType: 'enablingProject', ownerLabel: `Owner: ${project.owner}` };
    timelineItems.push(enriched);
    idMap.set(project.id, { type: 'enablingProject', item: enriched });
    project.steps.forEach((step) => {
      idMap.set(step.id, { type: 'step', item: step, parent: enriched });
    });
  });

  return { deliverables, timelineItems, idMap };
}

export function buildDependencyIndex(timelineItems) {
  const reverse = new Map();
  const addReverse = (targetId, source) => {
    if (!reverse.has(targetId)) reverse.set(targetId, []);
    reverse.get(targetId).push(source);
  };

  timelineItems.forEach((item) => {
    item.steps?.forEach((step) => {
      getStepDependencies(step).forEach((targetId) => {
        addReverse(targetId, { parent: item, step, label: step.summary });
      });
    });
  });

  return reverse;
}

export function resolveLabel(id, idMap) {
  const result = idMap.get(id);
  if (!result) return id;
  if (result.type === 'deliverable') return `${result.item.id} ${result.item.title}`;
  if (result.type === 'enablingProject') return result.item.title;
  if (result.type === 'step') return `${result.parent.id}: ${result.item.title}`;
  return id;
}

export function periodLabel(periodId) {
  return plan.timelinePeriods.find((period) => period.id === periodId)?.shortLabel || periodId;
}

export function unique(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = typeof item === 'string' ? item : `${item.parent?.id}-${item.step?.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
