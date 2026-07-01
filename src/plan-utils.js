import plan from './data/kings-edge-plan.json';
import enablingProjects from './data/enabling-projects.json';
import stepDependencyOverrides from './data/step-dependencies.json';

export { plan, enablingProjects };

export function getStepDependencies(step) {
  return stepDependencyOverrides[step.id] || step.dependsOn || [];
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
