import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../../framework';
import { SelectTeamsStep } from '../../../../../common/access/RolesWizard/steps/SelectTeamsStep';
// import { useTeamsFilters } from '../../hooks/useTeamsFilters';
import { useEdaView } from '../../../../common/useEventDrivenView';
import { edaAPI } from '../../../../common/eda-utils';
import { Team } from '../../../../../awx/interfaces/Team';

export function SelectEdaTeamsStep() {
  // const toolbarFilters = useTeamsFilters();
  const { t } = useTranslation();

  const tableColumns: ITableColumn<Team>[] = useMemo(() => {
    return [
      {
        header: t('Name'),
        cell: (team: Team) => <TextCell text={team.name} />,
        card: 'name',
        list: 'name',
        sort: 'username',
        maxWidth: 200,
      },
    ];
  }, [t]);

  const view = useEdaView<Team>({
    url: edaAPI`/teams/`,
    toolbarFilters: [],
    tableColumns,
  });

  return <SelectTeamsStep view={view} tableColumns={tableColumns} toolbarFilters={[]} />;
}
