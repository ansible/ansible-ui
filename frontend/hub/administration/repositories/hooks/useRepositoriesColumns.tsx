import { DateTimeCell, ITableColumn, TextCell, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { StatusCell } from '@ansible/common-ui/Status';
import { Label } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HubRoute } from '../../../main/HubRoutes';
import { Repository } from '../Repository';

export function useRepositoriesColumns(_options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useMemo<ITableColumn<Repository>[]>(
    () => [
      {
        header: t('Name'),
        cell: (repository) => (
          <TextCell
            text={repository.name}
            to={
              _options?.disableLinks
                ? undefined
                : getPageUrl(HubRoute.RepositoryPage, { params: { id: repository.name } })
            }
          />
        ),
        sort: 'name',
      },
      {
        header: t('Labels'),
        cell: (repository) => {
          if (Object.keys(repository.pulp_labels).length === 0) {
            return <TextCell text={t('None')} />;
          } else {
            return Object.keys(repository.pulp_labels).map((label) =>
              repository.pulp_labels[label] ? (
                <Label readOnly key={label}>
                  {label}: {repository.pulp_labels[label]}
                </Label>
              ) : (
                <Label readOnly key={label}>
                  {label}
                </Label>
              )
            );
          }
        },
      },
      {
        header: t('Private'),
        cell: (repository) => <TextCell text={repository.private ? t('Yes') : t('No')} />,
      },
      {
        header: t('Sync status'),
        cell: (repository) => {
          if (repository.remote) {
            if (repository.last_sync_task) {
              return <StatusCell status={repository.last_sync_task.state} />;
            } else {
              return <TextCell text={t('Never synced')} />;
            }
          } else {
            return <TextCell text={t('No remote')} />;
          }
        },
      },
      {
        header: t('Created'),
        cell: (repository) => <DateTimeCell value={repository.pulp_created} />,
        sort: 'pulp_created',
        defaultSortDirection: 'desc',
      },
    ],
    [t, _options?.disableLinks, getPageUrl]
  );
  return tableColumns;
}
