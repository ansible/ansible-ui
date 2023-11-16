import { useTranslation } from 'react-i18next';
import { ITableColumn, TextCell } from '../../../../../framework';
import { useCreatedColumn, useModifiedColumn } from '../../../../common/columns';
import { InstanceGroup } from '../../../interfaces/InstanceGroup';
import { useMemo } from 'react';
import { RouteObj } from '../../../../common/Routes';
import { Progress } from '@patternfly/react-core';

export function useInstanceGroupsColumns(options?: {
  disableSort?: boolean;
  disableLinks?: boolean;
}) {
  const { t } = useTranslation();
  const disableLinks = options && options.disableLinks;

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
                : RouteObj.InstanceGroupDetails.replace(':id', instanceGroup.id.toString())
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

    [t, disableLinks, createdColumn, modifiedColumn]
  );

  return tableColumns;
}
