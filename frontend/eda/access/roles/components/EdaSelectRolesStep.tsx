import { useMemo } from 'react';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useEdaRolesFilters } from '../hooks/useEdaRolesFilters';
import { edaAPI } from '../../../common/eda-utils';
import { useMultiSelectListView } from '../../../common/useMultiSelectListView';
import { EdaRbacRole } from '../../../interfaces/EdaRbacRole';
import { SelectRolesStep } from '../../../../common/access/RolesWizard/steps/SelectRolesStep';

export function EdaSelectRolesStep(props: {
  contentType: string;
  fieldNameForPreviousStep?: string;
  descriptionForRoleSelection?: string;
}) {
  const toolbarFilters = useEdaRolesFilters();
  const { t } = useTranslation();
  const { contentType, fieldNameForPreviousStep, descriptionForRoleSelection } = props;

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

  const view = useMultiSelectListView<EdaRbacRole>(
    {
      url: edaAPI`/role_definitions/`,
      toolbarFilters,
      tableColumns,
      queryParams: {
        content_type__model: contentType,
      },
    },
    'roles'
  );
  return (
    <SelectRolesStep
      view={view}
      tableColumns={tableColumns}
      toolbarFilters={toolbarFilters}
      fieldNameForPreviousStep={fieldNameForPreviousStep}
      descriptionForRoleSelection={descriptionForRoleSelection}
      // selectedItemsFromPreviousStep={users && users.length ? users : undefined}
      // labelForSelectedItemsFromPreviousStep={
      //   users && users.length ? t('Selected users') : undefined
      // }
      // descriptionForRoleSelection={descriptionForRoleSelection}
    />
  );
  // return (
  //   <PageMultiSelectList view={view} tableColumns={tableColumns} toolbarFilters={toolbarFilters} />
  // );
}
