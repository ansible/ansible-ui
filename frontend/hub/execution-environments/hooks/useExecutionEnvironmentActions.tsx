import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import {
  useDeleteExecutionEnvironments,
  useSyncExecutionEnvironments,
} from './useExecutionEnvironmentsActions';
import { useHubContext } from '../../useHubContext';

export function useExecutionEnvironmentActions() {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments();
  const syncExecutionEnvironments = useSyncExecutionEnvironments();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit'),
        onClick: () => {
          /**/
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
        icon: EditIcon,
        label: t('Sync selected environments'),
        onClick: (ee) => syncExecutionEnvironments([ee]),
        isDisabled:
          context.hasPermission('container.container.change_containernamespace') &&
          context.hasPermission(
            'container.container.container.namespace_change_containerdistribution'
          )
            ? ''
            : t`You do not have rights to this operation`,
      },
    ],
    [t, context, deleteExecutionEnvironments, syncExecutionEnvironments]
  );
}
