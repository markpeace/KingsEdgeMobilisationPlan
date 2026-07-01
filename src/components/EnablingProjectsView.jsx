import { enablingProjects } from '../plan-utils.js';

export default function EnablingProjectsView() {
  return (
    <main>
      <h1>Related projects</h1>
      <ul>
        {enablingProjects.map((project) => <li key={project.id}>{project.title}</li>)}
      </ul>
    </main>
  );
}
