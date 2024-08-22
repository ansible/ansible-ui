import { useTranslation } from 'react-i18next';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { PageFormSelect } from '../../../../../framework';

export function HubSelectResourceTypeStep() {
  const { t } = useTranslation();
  const { wizardData, setStepData, setWizardData } = usePageWizard();

  return (
    <PageFormSelect
      label={t('Resource type')}
      name="resourceType"
      options={[
        { value: 'galaxy.ansiblerepository', label: t('Repository') },
        { value: 'galaxy.collectionremote', label: t('Remote') },
        { value: 'galaxy.containernamespace', label: t('Execution Environment') },
        { value: 'galaxy.namespace', label: t('Namespace') },
        { value: 'system', label: t('System') },
      ]}
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
