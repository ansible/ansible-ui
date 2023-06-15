import { useEffect } from 'react';
import { FieldPath, FieldValues, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../common/crud/Data';
import { Project } from '../../../interfaces/Project';
import { useSelectProject } from '../hooks/useSelectProject';

export function PageFormProjectSelect<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: { name: TFieldName; projectPath?: string; project?: string }) {
  const { projectPath, project, name, ...rest } = props;

  const { t } = useTranslation();
  const {
    useSelectDialog: selectProject,
    view: { pageItems },
  } = useSelectProject(true);
  const { setValue } = useFormContext();
  const id = useWatch({ name: 'project' }) as number;

  useEffect(() => {
    let selectedProject;
    if (!id && pageItems?.length !== 1) return;
    if (pageItems?.length === 1) {
      selectedProject = pageItems[0];
    }
    if (id) {
      selectedProject = pageItems?.find((item) => item.id === id);
    }

    setValue(name as string, selectedProject?.name);
    setValue(projectPath as string, selectedProject);
    setValue(project as string, selectedProject?.id);
  }, [projectPath, project, id, pageItems, name, setValue]);
  return (
    <PageFormTextInput<TFieldValues, TFieldName, Project>
      {...rest}
      name={name}
      label={t('Project')}
      placeholder={t('Add project')}
      selectTitle={t('Select a project')}
      labelHelpTitle={t('Project')}
      labelHelp={t('Select the project containing the playbook you want this job to execute.')}
      selectValue={(project: Project) => project.name}
      selectOpen={selectProject}
      validate={async (projectName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Project>>(
            `/api/v2/projects/?name=${projectName}`
          );
          if (itemsResponse.results.length === 0) return t('Job project not found.');
          if (projectPath) setValue(projectPath, itemsResponse.results[0]);
          if (project) setValue(project, itemsResponse.results[0].id);
        } catch (err) {
          if (err instanceof Error) return err.message;
          else return 'Unknown error';
        }
        return undefined;
      }}
      isRequired
    />
  );
}
