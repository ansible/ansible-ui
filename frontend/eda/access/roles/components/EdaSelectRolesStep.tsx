import { useMemo } from 'react';
import { EdaRbacRole } from '../../../interfaces/EdaRBACRole';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useEdaRolesFilters } from '../hooks/useEdaRolesFilters';
import { useEdaView } from '../../../common/useEventDrivenView';
import { edaAPI } from '../../../common/eda-utils';
import { SelectRolesStep } from '../../../../common/access/RolesWizard/steps/SelectRolesStep';

export function EdaSelectRolesStep(props: { contentType: string }) {
  const toolbarFilters = useEdaRolesFilters();
  const { t } = useTranslation();
  const { contentType } = props;

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

  const view = useEdaView<EdaRbacRole>({
    url: edaAPI`/role_definitions/`,
    // toolbarFilters,
    tableColumns,
    queryParams: {
      content_type__model: contentType,
    },
  });

  return (
    <SelectRolesStep view={view} tableColumns={tableColumns} toolbarFilters={toolbarFilters} />
  );
}
