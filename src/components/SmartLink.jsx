import { resolveLabel } from '../plan-utils.js';

export default function SmartLink({ id, idMap }) {
  const result = idMap.get(id);
  if (!result) return <span className="chip">{id}</span>;
  if (result.type === 'deliverable') return <a className="chip" href={`#/deliverables/${id}`}>{result.item.id} {result.item.title}</a>;
  if (result.type === 'enablingProject') return <a className="chip" href="#/enabling-projects">{result.item.title}</a>;
  if (result.type === 'step') {
    const parent = result.parent;
    const href = parent.itemType === 'deliverable' ? `#/deliverables/${parent.id}` : '#/enabling-projects';
    return <a className="chip" href={href}>{parent.id}: {result.item.title}</a>;
  }
  return <span className="chip">{resolveLabel(id, idMap)}</span>;
}
