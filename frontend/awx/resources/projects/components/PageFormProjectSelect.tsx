import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Project } from '../../../interfaces/Project';
import { useSelectProject } from '../hooks/useSelectProject';

export function PageFormProjectSelect(props: {
  name: string;
  projectPath?: string;
  projectIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectProject = useSelectProject();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Project')}
      placeholder={t('Enter project')}
      selectTitle={t('Select an project')}
      selectValue={(project: Project) => project.name}
      selectOpen={selectProject}
      validate={async (projectName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Project>>(
            `/api/v2/projects/?name=${projectName}`
          );
          if (itemsResponse.results.length === 0) return t('Job project not found.');
          if (props.projectPath) setValue(props.projectPath, itemsResponse.results[0]);
          if (props.projectIdPath) setValue(props.projectIdPath, itemsResponse.results[0].id);
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
