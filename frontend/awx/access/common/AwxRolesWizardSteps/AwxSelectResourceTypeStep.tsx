import { useTranslation } from 'react-i18next';
import { LoadingPage, PageFormSelect } from '../../../../../framework';
import { useOptions } from '../../../../common/crud/useOptions';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { awxAPI } from '../../../common/api/awx-utils';

type ContentTypeOption = [string, string];

export function AwxSelectResourceTypeStep() {
  const { t } = useTranslation();
  const { wizardData, setStepData, setWizardData } = usePageWizard();
  const { data, isLoading } = useOptions<{
    actions: { POST: { content_type: { choices: ContentTypeOption[] } } };
  }>(awxAPI`/role_definitions/`);

  if (isLoading || !data) {
    return <LoadingPage />;
  }

  const options: ContentTypeOption[] = data?.actions?.POST?.content_type?.choices || [];

  return (
    <PageFormSelect
      label={t('Resource type')}
      name="resourceType"
      options={options
        .filter(([value, _]) => value?.startsWith('awx.'))
        .map(([value, display_name]) => ({
          value,
          label: display_name,
        }))}
      onChange={(option?: string) => {
        // Reset wizard/step data if the resource type selection was changed
        if ((wizardData as { [key: string]: unknown })['resourceType'] !== option) {
          setWizardData({});
          setStepData({});
        }
      }}
      placeholderText={t('Select a resource type')}
      isRequired
    />
  );
}
