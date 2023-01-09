import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PageFormTextInput } from '../../../../../framework/PageForm/Inputs/PageFormTextInput';
import { ItemsResponse, requestGet } from '../../../../Data';
import { Template } from '../../../interfaces/Template';
import { useSelectJobTemplate } from '../hooks/useSelectJobTemplate';

export function PageFormJobTemplateSelect(props: {
  name: string;
  jobTemplatePath?: string;
  jobTemplateIdPath?: string;
}) {
  const { t } = useTranslation();
  const selectJobTemplate = useSelectJobTemplate();
  const { setValue } = useFormContext();
  return (
    <PageFormTextInput
      name={props.name}
      label={t('Job template')}
      placeholder="Enter job template"
      selectTitle={t('Select a job template')}
      selectValue={(jobTemplate: Template) => jobTemplate.name}
      selectOpen={selectJobTemplate}
      validate={async (jobTemplateName: string) => {
        try {
          const itemsResponse = await requestGet<ItemsResponse<Template>>(
            `/api/v2/job_templates/?name=${jobTemplateName}`
          );
          if (itemsResponse.results.length === 0) return t('Job template not found.');
          if (props.jobTemplatePath) setValue(props.jobTemplatePath, itemsResponse.results[0]);
          if (props.jobTemplateIdPath)
            setValue(props.jobTemplateIdPath, itemsResponse.results[0].id);
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
