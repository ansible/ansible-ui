import { ITableColumn, QueryParams, TextCell } from '@ansible/ansible-ui-framework';
import { usePageWizard } from '@ansible/ansible-ui-framework/PageWizard/PageWizardProvider';
import { SelectRolesStep } from '@ansible/common-ui/access/RolesWizard/steps/SelectRolesStep';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlatformMultiSelectListView } from '../../../common/usePlatformMultiSelectListView';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { usePlatformRolesFilters } from '../../roles/hooks/usePlatformRolesFilters';

interface PlatformRbacRole {
  id: number;
  name: string;
  description: string;
  content_type: string;
}

const RoleNameCell = ({ role }: { role: PlatformRbacRole }) => <TextCell text={role.name} />;
const RoleDescriptionCell = ({ role }: { role: PlatformRbacRole }) =>
  role.description ? <TextCell text={role.description} /> : null;

const renderRoleNameCell = (role: PlatformRbacRole) => <RoleNameCell role={role} />;
const renderRoleDescriptionCell = (role: PlatformRbacRole) => <RoleDescriptionCell role={role} />;

export function PlatformSelectRolesStep() {
  const toolbarFilters = usePlatformRolesFilters();
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };

  const descriptionForRoleSelection = useMemo(() => {
    switch (resourceType as string) {
      case 'awx.credential':
        return t('Select roles to apply to all of your selected credentials.');
      case 'awx.instancegroup':
        return t('Select roles to apply to all of your selected instance groups.');
      case 'awx.inventory':
        return t('Select roles to apply to all of your selected inventories.');
      case 'awx.jobtemplate':
        return t('Select roles to apply to all of your selected job templates.');
      case 'awx.notificationtemplate':
        return t('Select roles to apply to all of your selected notification templates.');
      case 'awx.project':
        return t('Select roles to apply to all of your selected projects.');
      case 'awx.executionenvironment':
        return t('Select roles to apply to all of your selected execution environments.');
      case 'awx.workflowjobtemplate':
        return t('Select roles to apply to all of your selected workflow job templates.');
      case 'eda.edacredential':
        return t('Select roles to apply to all of your selected credentials.');
      case 'eda.project':
        return t('Select roles to apply to all of your selected projects.');
      case 'eda.activation':
        return t('Select roles to apply to all of your selected rulebook activations.');
      case 'eda.credentialtype':
        return t('Select roles to apply to all of your selected credential types.');
      case 'eda.decisionenvironment':
        return t('Select roles to apply to all of your selected decision environments.');
      case 'galaxy.ansiblerepository':
        return t('Select roles to apply to all of your selected repositories.');
      case 'galaxy.collectionremote':
        return t('Select roles to apply to all of your selected collection remotes.');
      case 'galaxy.containernamespace':
        return t('Select roles to apply to all of your selected execution environments.');
      case 'galaxy.namespace':
        return t('Select roles to apply to all of your selected namespaces.');
      case 'system':
        return t('Select system-level roles to apply.');
      default:
        return t('Select roles to apply to all of your selected resources.');
    }
  }, [resourceType, t]);

  const tableColumns: ITableColumn<PlatformRbacRole>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: renderRoleNameCell,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        cell: renderRoleDescriptionCell,
        card: 'description',
        list: 'description',
      },
    ];
  }, [t]);

  const queryParams = useMemo<QueryParams>(() => {
    const params: QueryParams = {};

    if (resourceType && typeof resourceType === 'string') {
      params['content_type__api_slug'] = resourceType;
    }

    return params;
  }, [resourceType]);

  const view = usePlatformMultiSelectListView<PlatformRbacRole>(
    {
      url: gatewayAPI`/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams,
      disableQueryString: true,
    },
    'platformRoles'
  );

  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep="resources"
      descriptionForRoleSelection={descriptionForRoleSelection}
    />
  );
}
