import { Project } from '../../../frontend/awx/interfaces/Project';

export function processProject(project: Project) {
  switch (project.description) {
    default:
    case 'successful':
      project.status = 'successful';
      break;
    case 'failed':
      project.status = 'failed';
      break;
  }
}
