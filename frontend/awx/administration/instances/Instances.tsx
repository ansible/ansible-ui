import { AlertProps, ButtonVariant, Tooltip } from '@patternfly/react-core';
import { EditIcon, HeartbeatIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  BytesCell,
  CapacityCell,
  DateTimeCell,
  IPageAction,
  ITableColumn,
  IToolbarFilter,
  PageActionSelection,
  PageActionType,
  PageHeader,
  PageLayout,
  PageTable,
  TextCell,
} from '../../../../framework';
import { usePageAlertToaster } from '../../../../framework/PageAlertToaster';
import { Dotted } from '../../../../framework/components/Dotted';
import { RouteObj } from '../../../Routes';
import { StatusCell } from '../../../common/StatusCell';
import { useCreatedColumn, useModifiedColumn } from '../../../common/columns';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { Instance } from '../../interfaces/Instance';
import { useAwxView } from '../../useAwxView';

export function Instances() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useInstancesFilters();
  const tableColumns = useInstancesColumns();
  const view = useAwxView<Instance>({
    url: '/api/v2/instances/',
    toolbarFilters,
    tableColumns,
  });

  const alertToaster = usePageAlertToaster();
  const postRequest = usePostRequest();
  const patchRequest = usePatchRequest();

  const toolbarActions = useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instances) => {
          for (const instance of instances) {
            postRequest(`/api/v2/instances/${instance.id}/health_check/`, {})
              .then(() => void view.refresh())
              .catch(
                // eslint-disable-next-line no-console
                console.error
              );
          }
        },
      },
    ],
    [postRequest, t, view]
  );

  const rowActions = useMemo<IPageAction<Instance>[]>(
    () => [
      {
        type: PageActionType.Switch,
        selection: PageActionSelection.Single,
        isPinned: true,
        onToggle: (instance, enabled) =>
          patchRequest(`/api/v2/instances/${instance.id}/`, { enabled }).then(view.refresh),
        isSwitchOn: (instance) => instance.enabled,
        label: t('Enabled'),
        labelOff: t('Disabled'),
        showPinnedLabel: false,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.secondary,
        isPinned: true,
        icon: HeartbeatIcon,
        label: t('Run health check'),
        onClick: (instance) => {
          const alert: AlertProps = {
            variant: 'info',
            title: t('Health check running'),
          };
          alertToaster.addAlert(alert);
          void postRequest(`/api/v2/instances/${instance.id}/health_check/`, {})
            .catch((err) => {
              alertToaster.replaceAlert(alert, {
                variant: 'danger',
                title: t('Health check failed'),
                children: err instanceof Error && err.message,
              });
            })
            .then(() => {
              void view.refresh();
              alertToaster.replaceAlert(alert, {
                variant: 'success',
                title: t('Health check success'),
                timeout: 2000,
              });
            });
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit instance'),
        onClick: (instance) =>
          navigate(RouteObj.EditInstance.replace(':id', instance.id.toString())),
      },
    ],
    [alertToaster, navigate, patchRequest, postRequest, t, view]
  );

  return (
    <PageLayout>
      <PageHeader
        title={t('Instances')}
        description={t(
          'Ansible node instances dedicated for a particular purpose indicated by node type.'
        )}
      />
      <PageTable<Instance>
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading instances')}
        emptyStateTitle={t('No instances yet')}
        emptyStateDescription={t('To get started, create an instance.')}
        emptyStateButtonText={t('Create instance')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateInstance)}
        {...view}
      />
    </PageLayout>
  );
}

export function useInstancesFilters() {
  const { t } = useTranslation();
  const toolbarFilters = useMemo<IToolbarFilter[]>(
    () => [
      {
        key: 'name',
        label: t('Name'),
        type: 'string',
        query: 'hostname__icontains',
        placeholder: t('contains'),
      },
      {
        key: 'type',
        label: t('Node type'),
        type: 'select',
        query: 'node_type',
        options: [
          { label: t('Hybrid'), value: 'hybrid' },
          { label: t('Execution'), value: 'execution' },
          { label: t('Control'), value: 'control' },
          { label: t('Hop'), value: 'hop' },
        ],
        placeholder: t('contains'),
      },
    ],
    [t]
  );
  return toolbarFilters;
}

export function useInstancesColumns(options?: { disableSort?: boolean; disableLinks?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const createdColumn = useCreatedColumn(options);
  const modifiedColumn = useModifiedColumn(options);
  const tableColumns = useMemo<ITableColumn<Instance>[]>(
    () => [
      {
        header: t('Name'),
        cell: (instance) => (
          <TextCell
            onClick={() =>
              navigate(RouteObj.InstanceDetails.replace(':id', instance.id.toString()))
            }
            text={instance.hostname}
          />
        ),
        sort: 'hostname',
      },
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
        header: t('Node type'),
        cell: (instance) => <NodeTypeCell node_type={instance.node_type} />,
        sort: 'node_type',
        card: 'description',
      },
      {
        header: t('Running jobs'),
        cell: (instance) => instance.jobs_running,
      },
      {
        header: t('Total jobs'),
        cell: (instance) => instance.jobs_total,
      },
      {
        header: t('Used capacity'),
        cell: (instance) =>
          instance.capacity && (
            <CapacityCell used={instance.consumed_capacity} capacity={instance.capacity} />
          ),
        list: 'secondary',
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
      },
      {
        header: t('Last health check'),
        cell: (instance) => <DateTimeCell format="since" value={instance.last_health_check} />,
        card: 'hidden',
      },
      createdColumn,
      modifiedColumn,
    ],
    [t, createdColumn, modifiedColumn, navigate]
  );
  return tableColumns;
}

export function NodeTypeCell(props: { node_type: string }) {
  const { t } = useTranslation();
  switch (props.node_type) {
    case 'hybrid':
      return (
        <Tooltip
          content={t(
            'Hybrid is the default node type for control plane nodes, responsible for runtime functions like project updates, management jobs and ansible-runner task operations. Hybrid nodes are also used for automation execution.'
          )}
        >
          <Dotted>{t('Hybrid node')}</Dotted>
        </Tooltip>
      );
    case 'control':
      return (
        <Tooltip
          content={t(
            'control nodes run project and inventory updates and system jobs, but not regular jobs. Execution capabilities are disabled on these nodes.'
          )}
        >
          <Dotted>{t('Control node')}</Dotted>
        </Tooltip>
      );
    case 'execution':
      return (
        <Tooltip
          content={t(
            'Execution nodes run jobs under ansible-runner with podman isolation. This node type is similar to isolated nodes. This is the default node type for execution plane nodes.'
          )}
        >
          <Dotted>{t('Execution node')}</Dotted>
        </Tooltip>
      );
    case 'hop':
      return (
        <Tooltip
          content={t(
            'similar to a jump host, hop nodes will route traffic to other execution nodes. Hop nodes cannot execute automation.'
          )}
        >
          <Dotted>{t('HOP node')}</Dotted>
        </Tooltip>
      );
    default:
      return <>{props.node_type}</>;
  }
}
