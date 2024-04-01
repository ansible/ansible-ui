import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../../framework';
// import { useTeamsFilters } from '../../hooks/useTeamsFilters';
import { edaAPI } from '../../../../common/eda-utils';
import { useMultiSelectListView } from '../../../../common/useMultiSelectListView';
import { PageMultiSelectList } from '../../../../../../framework/PageTable/PageMultiSelectList';
import { EdaTeam } from '../../../../interfaces/EdaTeam';

export function EdaSelectTeamsStep() {
  // const toolbarFilters = useTeamsFilters();
  const { t } = useTranslation();

  const tableColumns: ITableColumn<EdaTeam>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: EdaTeam) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const view = useMultiSelectListView<EdaTeam>(
    {
      url: edaAPI`/teams/`,
      toolbarFilters: [],
      tableColumns,
    },
    'teams'
  );

  return <PageMultiSelectList view={view} tableColumns={tableColumns} toolbarFilters={[]} />;
}
