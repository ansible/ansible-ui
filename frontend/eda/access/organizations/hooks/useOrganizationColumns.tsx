import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnTableOption, ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { EdaOrganization } from '../../../interfaces/EdaOrganization';
import { EdaRoute } from '../../../main/EdaRoutes';

export function useOrganizationColumns() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  return useMemo<ITableColumn<EdaOrganization>[]>(
    () => [
      {
        header: t('Name'),
        cell: (organization) => (
          <TextCell
            text={organization.name}
            to={getPageUrl(EdaRoute.OrganizationPage, {
              params: { id: organization.id },
            })}
          />
        ),
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        type: 'description',
        value: (organization) => organization.description,
        table: ColumnTableOption.description,
        card: 'description',
        list: 'description',
      },
      {
        header: t('Created'),
        type: 'datetime',
        value: (organization) => organization.created,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
      {
        header: t('Last modified'),
        type: 'datetime',
        value: (organization) => organization.modified,
        table: ColumnTableOption.expanded,
        card: 'hidden',
        list: 'secondary',
      },
    ],
    [getPageUrl, t]
  );
}
