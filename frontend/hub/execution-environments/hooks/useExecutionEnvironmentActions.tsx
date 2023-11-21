import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  usePageNavigate,
} from '../../../../framework';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import {
  useDeleteExecutionEnvironments,
  useSyncExecutionEnvironments,
  useSignExecutionEnvironments,
} from './useExecutionEnvironmentsActions';
import { useHubContext } from '../../useHubContext';
import { HubRoute } from '../../HubRoutes';

export function useExecutionEnvironmentActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const syncExecutionEnvironments = useSyncExecutionEnvironments(callback);
  const signExecutionEnvironment = useSignExecutionEnvironments(callback);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit'),
        isPinned: true,
        onClick: (ee: ExecutionEnvironment) => {
          pageNavigate(HubRoute.EditExecutionEnvironment, { params: { id: ee.name } });
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete environment'),
        onClick: (ee) => deleteExecutionEnvironments([ee]),
        isDanger: true,
        isDisabled: context.hasPermission('container.delete_containerrepository')
          ? ''
          : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        label: t('Sync selected environments'),
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
        label: t('Sign selected environments'),
        onClick: (ee) => signExecutionEnvironment([ee]),
        isDisabled:
          context.hasPermission('container.change_containernamespace') &&
          context.featureFlags.container_signing
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
    ]
  );
}
