import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonVariant } from '@patternfly/react-core';
import { CheckIcon, PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { HubRoute } from '../../../main/HubRoutes';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../../framework';
import { ExecutionEnvironment } from '../../ExecutionEnvironment';
import {
  useDeleteExecutionEnvironments,
  useSyncExecutionEnvironments,
  useSignExecutionEnvironments,
} from '../../hooks/useExecutionEnvironmentsActions';
import { useController } from '../../hooks/useController';

export function useExecutionEnvironmentPageActions(options: { refresh?: () => undefined }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(() => {
    pageNavigate(HubRoute.ExecutionEnvironments);
  });

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
      useInController,
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CheckIcon,
        label: t('Sign execution environment'),
        onClick: (ee) => signExecutionEnvironments([ee]),
      },
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
    pageNavigate,
    t,
    deleteExecutionEnvironments,
    signExecutionEnvironments,
    syncExecutionEnvironments,
    useInController,
  ]);
}
