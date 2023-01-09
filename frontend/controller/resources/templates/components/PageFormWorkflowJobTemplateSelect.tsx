import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Template } from '../../../interfaces/Template';
import { useSelectWorkflowJobTemplate } from '../hooks/useSelectWorkflowJobTemplate';

export function PageFormWorkflowJobTemplateSelect(props: {
  name: string;
  workflowJobTemplatePath?: string;
  workflowJobTemplateIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectWorkflowJobTemplate = useSelectWorkflowJobTemplate();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Workflow job template')}
      placeholder="Enter workflow job template"
      selectTitle={t('Select a workflow job template')}
      selectValue={(workflowJobTemplate: Template) => workflowJobTemplate.name}
      selectOpen={selectWorkflowJobTemplate}
      validate={async (workflowJobTemplateName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Template>>(
            `/api/v2/workflow_job_templates/?name=${workflowJobTemplateName}`
          );
          if (itemsResponse.results.length === 0) return t('Workflow job template not found.');
          if (props.workflowJobTemplatePath)
            setValue(props.workflowJobTemplatePath, itemsResponse.results[0]);
          if (props.workflowJobTemplateIdPath)
            setValue(props.workflowJobTemplateIdPath, itemsResponse.results[0].id);
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
