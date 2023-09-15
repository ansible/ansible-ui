import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaRoute } from '../../../EdaRoutes';
import { EdaGroup } from '../../../interfaces/EdaGroup';

export function useGroupColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaGroup>[]>(
    () => [
      {
        header: t('Name'),
        cell: (group) => (
          <TextCell
            text={group.name}
            to={getPageUrl(EdaRoute.GroupPage, { params: { id: group.id } })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (group) => group?.description && <TextCell text={group.description} />,
        card: 'description',
        list: 'description',
      },
    ],
    [getPageUrl, t]
  );
}
