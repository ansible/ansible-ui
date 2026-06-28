import { LoadingPage, PageFormSelect } from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../../common/eda-utils';

type ContentTypeOption = [string, string];

export function EdaSelectResourceTypeStep() {
  const { t } = useTranslation();
  const { wizardData, setWizardData, setStepData } = usePageWizard();
  const { data, isLoading } = useOptions<{
    actions: { GET: { content_type: { choices: ContentTypeOption[] } } };
  }>(edaAPI`/role_definitions/`);

  if (isLoading || !data) {
    return <LoadingPage />;
  }

  const options: ContentTypeOption[] = data?.actions?.GET?.content_type?.choices || [];

  return (
    <PageFormSelect
      label={t('Resource type')}
      name="resourceType"
      options={options
        .filter(
          ([value, _]) =>
            value?.startsWith('eda.') &&
            !['extravar', 'auditrule', 'rulebookprocess', 'rulebook'].some(function (v) {
              return value.endsWith(v);
            })
        )
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
