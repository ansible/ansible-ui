import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { ReorderItems } from '@ansible/ansible-ui-framework/components/ReorderItems';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { OrganizationWizardFormValues } from '../PlatformOrganizationForm';

export function OrganizationInstanceGroupsOrderStep() {
  const { wizardData, setWizardData, setStepData } = usePageWizard();
  const { instanceGroups = [] } = wizardData as OrganizationWizardFormValues;
  const { t } = useTranslation();

  return (
    <div>
      <TextContent style={{ marginBottom: 25 }}>
        <Text component={TextVariants.h2}>{t('Manage instance groups order')}</Text>
        <Text>
          {t(
            'The execution precedence is determined by the order in which these instance groups are listed. Use the draggable icon on the left to re-order your instance groups.'
          )}
        </Text>
      </TextContent>
      <ReorderItems<InstanceGroup>
        items={instanceGroups}
        setItems={(items) => {
          setWizardData({
            ...wizardData,
            instanceGroups: items,
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
