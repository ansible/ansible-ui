import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { ReorderItems } from '@ansible/ansible-ui-framework/components/ReorderItems';
import { InstanceGroup } from '@ansible/awx-ui/interfaces/InstanceGroup';
import { Content, ContentVariants } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { OrganizationWizardFormValues } from '../PlatformOrganizationForm';

export function OrganizationInstanceGroupsOrderStep() {
  const { wizardData, setWizardData, setStepData } = usePageWizard();
  const { instanceGroups = [] } = wizardData as OrganizationWizardFormValues;
  const { t } = useTranslation();

  return (
    <div>
      <Content style={{ marginBottom: 25 }}>
        <Content component={ContentVariants.h2}>{t('Manage instance groups order')}</Content>
        <Content component="p">
          {t(
            'The execution precedence is determined by the order in which these instance groups are listed. Use the draggable icon on the left to re-order your instance groups.'
          )}
        </Content>
      </Content>
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
