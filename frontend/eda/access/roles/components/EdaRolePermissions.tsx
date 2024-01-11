import { useTranslation } from 'react-i18next';
import { EdaRole } from '../../../interfaces/EdaRole';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
} from '@patternfly/react-core';

export function EdaRolePermissions(props: { role?: EdaRole }) {
  const { t } = useTranslation();
  const { role } = props;

  const ResourceTypes = {
    activation: t('Activation'),
    activation_instance: t('Activation Instance'),
    audit_rule: t('Audit Rule'),
    audit_event: t('Audit Event'),
    task: t('Task'),
    user: t('User'),
    project: t('Project'),
    inventory: t('Inventory'),
    extra_var: t('Extra Vars'),
    playbook: t('Playbook'),
    rulebook: t('Rulebook'),
    role: t('Role'),
    decision_environment: t('Decision environment'),
    credential: t('Credential'),
  };

  return (
    <DescriptionList
      isHorizontal
      horizontalTermWidthModifier={{
        default: '12ch',
        sm: '15ch',
        md: '20ch',
        lg: '28ch',
        xl: '30ch',
        '2xl': '35ch',
      }}
    >
      {!role && (
        <DescriptionListGroup data-cy={'permission-categories-no-permissions'}>
          <DescriptionListTerm>{t('No permissions')}</DescriptionListTerm>
        </DescriptionListGroup>
      )}
      {role?.permissions.map((permission) => (
        <DescriptionListGroup key={permission?.resource_type}>
          <DescriptionListTerm
            data-cy={'permissions'}
            style={{ fontWeight: 'normal' }}
            key={permission?.resource_type}
          >
            {ResourceTypes[permission?.resource_type] || permission?.resource_type}
          </DescriptionListTerm>
          <DescriptionListDescription>
            {!!permission?.action.length && (
              <LabelGroup numLabels={5}>
                {permission?.action.map((action) => <Label key={action}>{action}</Label>)}
              </LabelGroup>
            )}
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </DescriptionList>
  );
}
