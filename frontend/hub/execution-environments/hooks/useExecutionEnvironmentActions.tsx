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

export function useExecutionEnvironmentActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const syncExecutionEnvironments = useSyncExecutionEnvironments(callback);
  const signExecutionEnvironment = useSignExecutionEnvironments(callback);
  const pageNavigate = usePageNavigate();
  const useInController = useController();

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
        isDisabled:
          context.hasPermission('container.change_containernamespace') &&
          context.featureFlags.container_signing
            ? ''
            : t`You do not have rights to this operation`,
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
      deleteExecutionEnvironments,
      syncExecutionEnvironments,
      signExecutionEnvironment,
      pageNavigate,
      useInController,
    ]
  );
}
