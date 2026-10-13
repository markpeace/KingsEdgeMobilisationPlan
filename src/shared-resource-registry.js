import firstRegistry from './data/shared-resources.json' with { type: 'json' };
import secondRegistry from './data/v2/shared-resources.json' with { type: 'json' };
import { planVersion } from './plan-version.js';

const registry = planVersion === 'v2' ? secondRegistry : firstRegistry;

export const sharedResourceRegistry = registry;

export function getSharedResource(id) {
  return (registry.sharedResources || []).find((resource) => resource.id === id) || null;
}
