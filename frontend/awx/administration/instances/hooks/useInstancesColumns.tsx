import { Progress, Tooltip } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BytesCell,
  ColumnModalOption,
  ColumnTableOption,
  ITableColumn,
  usePageNavigate,
} from '../../../../../framework';
import { Dotted } from '../../../../../framework/components/Dotted';
import { capitalizeFirstLetter } from '../../../../../framework/utils/strings';
import { useCreatedColumn, useModifiedColumn, useNameColumn } from '../../../../common/columns';
import { Instance } from '../../../interfaces/Instance';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useNodeTypeTooltip } from './useNodeTypeTooltip';
import { InstanceForksSlider } from '../components/InstanceForksSlider';
import { StatusCell } from '../../../../common/Status';
import { Unavailable } from '../../../../../framework/components/Unavailable';
import { computeForks } from './useInstanceActions';

export function useInstancesColumns(
  options?: { disableSort?: boolean; disableLinks?: boolean },
  onNameClick?: (instance: Instance) => void
) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const toolTipMap: {
    [item: string]: string;
  } = useNodeTypeTooltip();

  const nameClick = useCallback(
    (instance: Instance) =>
      pageNavigate(AwxRoute.InstanceDetails, {
        params: { id: instance.id },
      }),
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
    onClick: onNameClick ?? nameClick,
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
          <StatusCell status={instance.health_check_pending ? 'running' : instance.node_state} />
        ),
        sort: 'errors',
        modal: 'hidden',
      },
      {
        cell: makeReadable,
        sort: 'node_type',
        header: t('Node type'),
        card: 'subtitle',
        list: 'subtitle',
      },
      {
        header: t('Capacity adjustment'),
        cell: (instance: Instance) => {
          const instanceForks = computeForks(
            instance.mem_capacity,
            instance.cpu_capacity,
            parseFloat(instance.capacity_adjustment)
          );
          if (instanceForks > 0) {
            return <InstanceForksSlider instance={instance} />;
          } else {
            return instance.node_type === 'hop' ? (
              <Tooltip
                isContentLeftAligned={true}
                content={t('Cannot adjust capacity for hop nodes.')}
              >
                <Dotted>{t('Unavailable')}</Dotted>
              </Tooltip>
            ) : (
              <Tooltip isContentLeftAligned={true} content={t('0 forks. Cannot adjust capacity.')}>
                <Dotted>{t('Unavailable')}</Dotted>
              </Tooltip>
            );
          }
        },
        modal: ColumnModalOption.hidden,
      },
      {
        header: t('Used capacity'),
        cell: (instance) =>
          instance.node_type === 'hop' ? undefined : instance.enabled ? (
            <Progress value={Math.round(100 - instance.percent_capacity_remaining)} />
          ) : (
            <Unavailable>{t(`Unavailable`)}</Unavailable>
          ),
        list: 'secondary',
        modal: 'hidden',
      },
      {
        header: t('Running jobs'),
        cell: (instance) => instance.jobs_running,
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Total jobs'),
        cell: (instance) => instance.jobs_total,
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Memory'),
        cell: (instance) => instance.memory && <BytesCell bytes={instance.memory} />,
        sort: 'memory',
        list: 'secondary',
        table: ColumnTableOption.expanded,
      },
      {
        header: t('Policy type'),
        cell: (instance) => (instance.managed_by_policy ? t('Auto') : t('Manual')),
        table: ColumnTableOption.expanded,
      },
      createdColumn,
      modifiedColumn,
    ],
    [t, createdColumn, nameColumn, makeReadable, modifiedColumn]
  );
  return tableColumns;
}
