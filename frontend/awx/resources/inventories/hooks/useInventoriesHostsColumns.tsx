import { Chip, ChipGroup } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageNavigate, ITableColumn } from '../../../../../framework';
import {
  useNameColumn,
  useDescriptionColumn,
  useCreatedColumn,
  useModifiedColumn,
} from '../../../../common/columns';
import { AwxRoute } from '../../../main/AwxRoutes';
import { AwxHost } from '../../../interfaces/AwxHost';

export function useInventoriesHostsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const nameClick = useCallback(
    (host: AwxHost) => pageNavigate(AwxRoute.HostDetails, { params: { id: host.id } }),
    [pageNavigate]
  );
  const nameColumn = useNameColumn({
    ...options,
    onClick: nameClick,
  });
  const descriptionColumn = useDescriptionColumn();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const relatedGroupColumn = useRelatedGroupsColumn();
  const tableColumns = useMemo<ITableColumn<AwxHost>[]>(
    () => [nameColumn, descriptionColumn, relatedGroupColumn, createdColumn, modifiedColumn],
    [nameColumn, descriptionColumn, relatedGroupColumn, createdColumn, modifiedColumn]
  );
  return tableColumns;
}

function useRelatedGroupsColumn() {
  const { t } = useTranslation();

  const column: ITableColumn<AwxHost> = useMemo(
    () => ({
      header: t('Related Groups'),
      cell: (host) => {
        const groups: { results: Array<{ id: number; name: string }>; count: number } = host
          ?.summary_fields?.groups ?? {
          results: [],
          count: 0,
        };
        return (
          <ChipGroup aria-label={t`Related Groups`}>
            {groups.results.map((group) => (
              <Chip key={group.name} isReadOnly>
                {group.name}
              </Chip>
            ))}
          </ChipGroup>
        );
      },
      sort: undefined,
      defaultSortDirection: 'desc',
    }),
    [t]
  );
  return column;
}
