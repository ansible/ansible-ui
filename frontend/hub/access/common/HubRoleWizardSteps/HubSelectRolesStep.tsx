import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { SelectRolesStep } from '../../../../common/access/RolesWizard/steps/SelectRolesStep';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useHubRoleFilters } from '../hooks/useHubRoleFilters';
import { HubRbacRole } from '../../../interfaces/expanded/HubRbacRole';
import { useHubMultiSelectListView } from '../../../common/useHubMultiSelectListView';
import { hubAPI } from '../../../common/api/formatPath';

export function HubSelectRolesStep(props: {
  contentType?: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
  title?: string;
}) {
  const toolbarFilters = useHubRoleFilters();
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };
  const { fieldNameForPreviousStep, title } = props;

  const contentType = useMemo(() => {
    return props.contentType ? props.contentType : (resourceType as string)?.split('.').pop() ?? '';
  }, [props.contentType, resourceType]);

  const descriptionForRoleSelection = useMemo(() => {
    if (props.descriptionForRoleSelection) {
      return props.descriptionForRoleSelection;
    }
    switch (resourceType as string) {
      case 'galaxy.namespace':
        return t('Select roles to apply to all of your selected namespaces.');
      case 'galaxy.ansiblerepository':
        return t('Select roles to apply to all of your selected repositories.');
      case 'galaxy.collectionremote':
        return t('Select roles to apply to all of your selected remotes.');
      case 'galaxy.containernamespace':
        return t('Select roles to apply to all of your selected execution environments.');
      default:
        return t('Select roles to apply to all of your selected resources.');
    }
  }, [props.descriptionForRoleSelection, resourceType, t]);

  const tableColumns: ITableColumn<HubRbacRole>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (role) => <TextCell text={role.name} />,
        card: 'name',
        list: 'name',
        sort: 'name',
      },
      {
        header: t('Description'),
        cell: (role) => role.description && <TextCell text={role.description} />,
        card: 'description',
        list: 'description',
      },
    ];
  }, [t]);

  const view = useHubMultiSelectListView<HubRbacRole>(
    {
      url: hubAPI`/_ui/v2/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams: {
        ...(contentType !== 'system' && { content_type__model: contentType }),
        ...(contentType === 'system' && { content_type__isnull: 'true' }),
        name__startswith: 'galaxy.',
      },
    },
    'hubRoles'
  );

  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep={fieldNameForPreviousStep}
      descriptionForRoleSelection={
        resourceType !== 'system' ? descriptionForRoleSelection : undefined
      }
      title={title}
    />
  );
}
