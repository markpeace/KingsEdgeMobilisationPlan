// The URL identifies the plan being read. The existing URL remains version 1.
export const planVersion = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('plan') === 'v2'
  ? 'v2'
  : 'v1';

export function planVersionUrl(version) {
  const url = new URL(window.location.href);
  if (version === 'v2') url.searchParams.set('plan', 'v2');
  else url.searchParams.delete('plan');
  return url.toString();
}
