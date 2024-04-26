import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useAwxMultiSelectListView } from '../../../common/useAwxMultiSelectListView';
import { SelectRolesStep } from '../../../../common/access/RolesWizard/steps/SelectRolesStep';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';
import { useAwxRolesFilters } from '../../roles/useAwxRolesFilters';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxRbacRole } from '../../../interfaces/AwxRbacRole';

export function AwxSelectRolesStep(props: {
  contentType?: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
}) {
  const toolbarFilters = useAwxRolesFilters();
  const { t } = useTranslation();
  const { wizardData } = usePageWizard();
  const { resourceType } = wizardData as { [key: string]: unknown };
  const { fieldNameForPreviousStep } = props;

  const contentType = useMemo(() => {
    return props.contentType ? props.contentType : (resourceType as string)?.split('.').pop() ?? '';
  }, [props.contentType, resourceType]);

  const descriptionForRoleSelection = useMemo(() => {
    if (props.descriptionForRoleSelection) {
      return props.descriptionForRoleSelection;
    }
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
      default:
        return t('Select roles to apply to all of your selected resources.');
    }
  }, [props.descriptionForRoleSelection, resourceType, t]);

  const tableColumns: ITableColumn<AwxRbacRole>[] = useMemo(() => {
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

  const view = useAwxMultiSelectListView<AwxRbacRole>(
    {
      url: awxAPI`/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams: {
        content_type__model: contentType,
      },
    },
    'awxRoles'
  );
  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep={fieldNameForPreviousStep}
      descriptionForRoleSelection={descriptionForRoleSelection}
    />
  );
}
