import { Progress } from '@patternfly/react-core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell, useGetPageUrl } from '../../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../common/columns';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { AwxRoute } from '../../../main/AwxRoutes';

export function useInstanceGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const disableLinks = options && options.disableLinks;
  const getPageUrl = useGetPageUrl();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);

  const tableColumns = useMemo<ITableColumn<InstanceGroup>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instanceGroup) => (
          <TextCell
            to={
              disableLinks
                ? undefined
                : getPageUrl(AwxRoute.InstanceGroupDetails, { params: { id: instanceGroup.id } })
            }
            text={instanceGroup.name}
          />
        ),
        sort: 'name',
        card: 'name',
        list: 'name',
      },
      {
        header: t('Type'),
        cell: (instanceGroup) => (
          <TextCell
            text={instanceGroup.is_container_group ? t('Container group') : t('Instance group')}
          />
        ),
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Running jobs'),
        cell: (instanceGroup) => instanceGroup.jobs_running,
      },
      {
        header: t('Total jobs'),
        cell: (instanceGroup) => instanceGroup.jobs_total,
      },
      {
        header: t('Instances'),
        cell: (instanceGroup) => instanceGroup.instances,
      },
      {
        header: t('Used capacity'),
        cell: (instanceGroup) => {
          if (!instanceGroup.is_container_group) {
            if (instanceGroup.capacity) {
              return (
                <Progress value={Math.round(100 - instanceGroup.percent_capacity_remaining)} />
              );
            }
            return <TextCell text={t('Unavailable')} color="red" />;
          }
          // Capacity is not displayed for container groups
          return null;
        },
        list: 'secondary',
      },
      createdColumn,
      modifiedColumn,
    ],

    [t, createdColumn, modifiedColumn, disableLinks, getPageUrl]
  );

  return tableColumns;
}
