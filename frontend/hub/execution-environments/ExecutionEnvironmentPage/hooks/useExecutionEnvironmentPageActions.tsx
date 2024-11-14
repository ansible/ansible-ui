import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { ButtonVariant } from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCanSignEE } from '../../../common/utils/canSign';
import { HubRoute } from '../../../main/HubRoutes';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import { useController } from '../../hooks/useController';
import {
  useDeleteExecutionEnvironments,
  useSignExecutionEnvironments,
  useSyncExecutionEnvironments,
} from '../../hooks/useExecutionEnvironmentsActions';

export function useExecutionEnvironmentPageActions(options: { refresh?: () => undefined }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(() => {});

  const { refresh } = options;

  const signExecutionEnvironments = useSignExecutionEnvironments(() => {
    void refresh?.();
  });

  const syncExecutionEnvironments = useSyncExecutionEnvironments(() => {
    void refresh?.();
  });

  const isSyncRunning = (ee: ExecutionEnvironment) =>
    ['running', 'waiting', 'pending'].includes(
      ee.pulp?.repository?.remote?.last_sync_task?.state || ''
    );

  const useInController = useController();
  const canSignEE = useCanSignEE();

  return useMemo(() => {
    const actions: IPageAction<ExecutionEnvironment>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit execution environment'),
        onClick: (ee) =>
          pageNavigate(HubRoute.EditExecutionEnvironment, { params: { id: ee?.name } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncAltIcon,
        label: t('Sync execution environment'),
        isHidden: (ee: ExecutionEnvironment) => !ee.pulp?.repository?.remote,
        isDisabled: (ee) => (isSyncRunning(ee) ? t('Sync is already running.') : undefined),
        onClick: (ee: ExecutionEnvironment) => syncExecutionEnvironments([ee]),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CheckIcon,
        label: t('Sign execution environment'),
        isDisabled: () => (canSignEE ? undefined : t('You do not have rights to this operation')),
        onClick: (ee) => signExecutionEnvironments([ee]),
      },
      useInController,
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete execution environment'),
        onClick: (ee) => deleteExecutionEnvironments([ee]),
        isDanger: true,
      },
    ];
    return actions;
  }, [
    t,
    useInController,
    pageNavigate,
    syncExecutionEnvironments,
    canSignEE,
    signExecutionEnvironments,
    deleteExecutionEnvironments,
  ]);
}
