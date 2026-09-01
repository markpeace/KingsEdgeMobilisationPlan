import registry from './data/shared-resources.json';

export const sharedResourceRegistry = registry;

export function getSharedResource(id) {
  return (registry.sharedResources || []).find((resource) => resource.id === id) || null;
}
