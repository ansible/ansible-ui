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
import { useParams } from 'react-router-dom';

export function useInventoriesHostsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const pageNavigate = usePageNavigate();
  const params = useParams<{ inventory_type: string; id: string }>();
  const nameClick = useCallback(
    (host: AwxHost) =>
      pageNavigate(AwxRoute.InventoryHostDetails, {
        params: {
          inventory_type: params.inventory_type,
          id: params.id,
          host_id: host.id,
        },
      }),
    [pageNavigate, params.id, params.inventory_type]
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
