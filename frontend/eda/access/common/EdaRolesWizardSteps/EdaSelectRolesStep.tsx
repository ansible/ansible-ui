import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useEdaRolesFilters } from '../../roles/hooks/useEdaRolesFilters';
import { edaAPI } from '../../../common/eda-utils';
import { useEdaMultiSelectListView } from '../../../common/useEdaMultiSelectListView';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { SelectRolesStep } from '../../../../common/access/RolesWizard/steps/SelectRolesStep';
import { usePageWizard } from '../../../../../framework/PageWizard/PageWizardProvider';

export function EdaSelectRolesStep(props: {
  contentType?: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
}) {
  const toolbarFilters = useEdaRolesFilters();
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
      case 'eda.edacredential':
        return t('Select roles to apply to all of your selected credentials.');
      case 'eda.project':
        return t('Select roles to apply to all of your selected projects.');
      case 'eda.activation':
        return t('Select roles to apply to all of your selected rulebook activations.');
      case 'eda.rulebook':
        return t('Select roles to apply to all of your selected rulebooks.');
      case 'eda.rulebookprocess':
        return t('Select roles to apply to all of your selected rulebook processes.');
      case 'eda.credentialtype':
        return t('Select roles to apply to all of your selected credential types.');
      case 'eda.decisionenvironment':
        return t('Select roles to apply to all of your selected decision environments.');
      case 'eda.auditrule':
        return t('Select roles to apply to all of your selected audit rules.');
      default:
        return t('Select roles to apply to all of your selected resources.');
    }
  }, [props.descriptionForRoleSelection, resourceType, t]);

  const tableColumns: ITableColumn<EdaRbacRole>[] = useMemo(() => {
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

  const view = useEdaMultiSelectListView<EdaRbacRole>(
    {
      url: edaAPI`/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams: {
        content_type__model: contentType,
      },
    },
    'edaRoles'
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
