import { JobTemplate } from '../../interfaces/JobTemplate';

export function getDefaultValues(): Partial<JobTemplate> {
  const { search } = document.location;

  type projectParamInterface = {
    project_id: null | string;
    project_name: null | string;
  };
  const projectParams: projectParamInterface = {
    project_id: null,
    project_name: null,
  };
  search
    .replace(/^\?/, '')
    .split('&')
    .map((s: string) => s.split('='))
    .forEach((item) => {
      const [key, value] = item;
      if (!(key in projectParams)) {
        return;
      }
      projectParams[key as keyof projectParamInterface] = decodeURIComponent(value);
      return;
    });

  return {
    description: '',
    inventory: null,
    job_type: 'run',
    name: '',
    playbook: '',
    project: undefined,
    scm_branch: '',
    execution_environment: null,
  };
}
