import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaTeam } from '../../../interfaces/EdaTeam';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useTeamColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaTeam>[]>(
    () => [
      {
        header: t('Name'),
        cell: (team) => (
          <TextCell
            text={team.name}
            to={getPageUrl(EdaRoute.TeamPage, {
              params: { id: team.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (team) => team.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (team) => team.created,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (team) => team.modified,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
