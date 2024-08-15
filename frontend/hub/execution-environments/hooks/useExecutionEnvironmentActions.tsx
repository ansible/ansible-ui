import { CheckIcon, PencilAltIcon, SyncAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { useHubContext } from '../../common/useHubContext';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import {
  useDeleteExecutionEnvironments,
  useSignExecutionEnvironments,
  useSyncExecutionEnvironments,
} from './useExecutionEnvironmentsActions';
import { useController } from './useController';
import { useCanSignEE } from '../../common/utils/canSign';

export function useExecutionEnvironmentActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const syncExecutionEnvironments = useSyncExecutionEnvironments(callback);
  const signExecutionEnvironment = useSignExecutionEnvironments(callback);
  const pageNavigate = usePageNavigate();
  const useInController = useController();
  const canSignEE = useCanSignEE();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit execution environment'),
        isPinned: true,
        onClick: (ee: ExecutionEnvironment) => {
          pageNavigate(HubRoute.EditExecutionEnvironment, { params: { id: ee.name } });
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: SyncAltIcon,
        label: t('Sync execution environment'),
        isHidden: (ee: ExecutionEnvironment) => !ee.pulp?.repository?.remote,
        onClick: (ee) => syncExecutionEnvironments([ee]),
        isDisabled:
          context.hasPermission('container.change_containernamespace') &&
          context.hasPermission('container.namespace_change_containerdistribution')
            ? ''
            : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: CheckIcon,
        label: t('Sign execution environment'),
        onClick: (ee) => signExecutionEnvironment([ee]),
        isDisabled: canSignEE ? '' : t`You do not have rights to this operation`,
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
        isDisabled: context.hasPermission('container.delete_containerrepository')
          ? ''
          : t`You do not have rights to this operation`,
      },
    ],
    [
      t,
      context,
      canSignEE,
      useInController,
      pageNavigate,
      syncExecutionEnvironments,
      signExecutionEnvironment,
      deleteExecutionEnvironments,
    ]
  );
}
