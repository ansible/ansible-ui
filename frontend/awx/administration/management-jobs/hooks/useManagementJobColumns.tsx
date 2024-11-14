import { ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SystemJobTemplate } from '../../../interfaces/SystemJobTemplate';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useManagementJobColumns(): ITableColumn<SystemJobTemplate>[] {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();

  const tableColumns = useMemo<ITableColumn<SystemJobTemplate>[]>(
    () => [
      {
        id: 'name',
        header: t('Name'),
        cell: (systemJobTemplate: SystemJobTemplate) => (
          <TextCell
            text={systemJobTemplate.name}
            to={getPageUrl(AwxRoute.ManagementJobSchedules, {
              params: {
                id: systemJobTemplate.id,
              },
            })}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Description'),
        cell: (systemJobTemplate) => <TextCell text={systemJobTemplate.description} />,
      },
    ],
    [t, getPageUrl]
  );

  return tableColumns;
}
