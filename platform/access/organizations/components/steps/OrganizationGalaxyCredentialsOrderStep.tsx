import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { ReorderItems } from '@ansible/ansible-ui-framework/components/ReorderItems';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { OrganizationWizardFormValues } from '../PlatformOrganizationForm';

export function OrganizationGalaxyCredentialsOrderStep() {
  const { wizardData, setWizardData, setStepData } = usePageWizard();
  const { galaxyCredentials = [] } = wizardData as OrganizationWizardFormValues;
  const { t } = useTranslation();

  return (
    <div>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Manage galaxy credential order')}</Text>
        <Text>
          {t(
            'The order of these credentials determines the priority for searching and synchronizing content. Use the draggable icon on the left to re-order your galaxy credentials.'
          )}
        </Text>
      </TextContent>
      <ReorderItems<Credential>
        items={galaxyCredentials}
        setItems={(items) => {
          setWizardData({
            ...wizardData,
            galaxyCredentials: items,
          });
          setStepData((prev) => ({ ...prev, mapping: { mappings: items } }));
        }}
        columns={[{ header: t('Name'), cell: (item) => item.name }]}
        keyFn={(item) => item.name}
        isSelected={() => false}
        selectItem={() => null}
        unselectItem={() => null}
        allSelected={false}
        selectAll={() => null}
        unselectAll={() => null}
      />
    </div>
  );
}
