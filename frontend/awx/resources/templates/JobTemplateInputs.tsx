import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormSelectOption } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { useGet } from '../../../common/useItem';
import { PageFormExecutionEnvironmentSelect } from '../../administration/execution-environments/components/PageFormExecutionEnvironmentSelect';
import { Project } from '../../interfaces/Project';
import { PageFormInventorySelect } from '../inventories/components/PageFormInventorySelect';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectSelect';

function JobTemplateInputs() {
  const { t } = useTranslation();
  const projectId = useWatch({ name: 'projectId' }) as number;
  const project = useWatch({ name: 'project' }) as Project;
  const { data: playbooks } = useGet<string[]>(`/api/v2/projects/${projectId}/playbooks/`);
  return (
    <>
      <PageFormTextInput name="name" label={t('Name')} isRequired />
      <PageFormTextInput name="description" label={t('Description')} />
      <PageFormSelectOption
        name="job_type"
        id="job_type"
        label={t('Job Type')}
        options={[
          { label: 'Check', value: 'check' },
          { label: 'Run', value: 'run' },
        ]}
        placeholderText={t('Select Job Type')}
      />
      <PageFormInventorySelect name="summary_fields.inventory.name" inventoryIdPath="inventory" />
      <PageFormProjectSelect
        name="summary_fields.project.name"
        projectIdPath="projectId"
        projectPath="project"
      />
      {projectId ? (
        <PageFormSelectOption
          name="playbook"
          placeholderText={t('Select playbook')}
          label={t('Playbook')}
          isRequired
          options={playbooks?.map((playbook) => ({ label: playbook, value: playbook })) ?? []}
        />
      ) : null}
      <PageFormExecutionEnvironmentSelect
        name="summary_fields.execution_environment.name"
        executionEnvironmentIdPath="execution_environment"
      />
      {project?.allow_override ? (
        <PageFormTextInput name="scm-branch" label={t('Source Control Branch')} />
      ) : null}
    </>
  );
}

export default JobTemplateInputs;
