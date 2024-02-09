import { Progress, Tooltip } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BytesCell,
  ColumnTableOption,
  DateTimeCell,
  ITableColumn,
  usePageNavigate,
} from '../../../../../framework';
import { Dotted } from '../../../../../framework/components/Dotted';
import { capitalizeFirstLetter } from '../../../../../framework/utils/strings';
import { StatusCell } from '../../../../common/Status';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useNodeTypeTooltip } from './useNodeTypeTooltip';

export function useInstancesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const toolTipMap: {
    [item: string]: string;
  } = useNodeTypeTooltip();

  const nameClick = useCallback(
    (instance: Instance) => pageNavigate(AwxRoute.InstanceDetails, { params: { id: instance.id } }),
    [pageNavigate]
  );

  const makeReadable = useCallback(
    (instance: Instance) => {
      return (
        <Tooltip content={toolTipMap[instance.node_type]}>
          <Dotted>{`${capitalizeFirstLetter(instance.node_type)}`}</Dotted>
        </Tooltip>
      );
    },
    [toolTipMap]
  );

  const nameColumn = useNameColumn<Instance>({
    ...options,
    onClick: nameClick,
    header: t('Name'),
    sort: 'hostname',
  });

  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);

  const tableColumns = useMemo<ITableColumn<Instance>[]>(
    () => [
      nameColumn,
      {
        header: t('Status'),
        cell: (instance) => (
          <StatusCell
            status={!instance.enabled ? 'disabled' : instance.errors ? 'error' : 'healthy'}
          />
        ),
        sort: 'errors',
      },
      {
        cell: makeReadable,
        sort: 'node_type',
        header: t('Node type'),
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Running jobs'),
        cell: (instance) => instance.jobs_running,
      },
      {
        header: t('Total jobs'),
        cell: (instance) => instance.jobs_total,
        list: 'secondary',
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Used capacity'),
        cell: (instance) => (
          <Progress value={Math.round(100 - instance.percent_capacity_remaining)} />
        ),
        list: 'secondary',
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Memory'),
        cell: (instance) => instance.memory && <BytesCell bytes={instance.memory} />,
        sort: 'memory',
        list: 'secondary',
      },
      {
        header: t('Policy type'),
        cell: (instance) => (instance.managed_by_policy ? t('Auto') : t('Manual')),
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Last health check'),
        cell: (instance) => <DateTimeCell format="since" value={instance.last_health_check} />,
        card: 'hidden',
      },
      createdColumn,
      modifiedColumn,
    ],
    [t, createdColumn, nameColumn, makeReadable, modifiedColumn]
  );
  return tableColumns;
}
