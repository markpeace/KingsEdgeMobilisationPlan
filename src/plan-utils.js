export function getStepDependencies(step) {
  return step.dependsOn || [];
}
