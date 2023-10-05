import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, EditIcon } from '@patternfly/react-icons';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { TrashIcon } from '@patternfly/react-icons';
import { useHubContext } from '../../useHubContext';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { hubAPI } from '../../api/utils';

export function useExecutionEnvironmentsActions() {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusIcon,
        label: t('Add execution environment'),
        onClick: () => {
          /**/
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete selected environments'),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
        isDisabled: context.hasPermission('container.delete_containerrepository')
          ? ''
          : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: EditIcon,
        label: t('Sync selected environments'),
        onClick: () => {},
        isDanger: true,
        isDisabled:
          context.hasPermission('container.container.change_containernamespace') &&
          context.hasPermission(
            'container.container.container.namespace_change_containerdistribution'
          )
            ? ''
            : t`You do not have rights to this operation`,
      },
    ],
    [t, context, deleteExecutionEnvironments]
  );
}

export function useDeleteExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<ExecutionEnvironment>();
  return useCallback(
    (ees: ExecutionEnvironment[]) => {
      bulkAction({
        title: t('Permanently delete execution environments', { count: ees.length }),
        confirmText: t('Yes, I confirm that I want to delete these {{count}} collections.', {
          count: ees.length,
        }),
        actionButtonText: t('Delete collections', { count: ees.length }),
        items: ees.sort((l, r) => compareStrings(l.name || '' + l.name, r.name || '' + l.name)),
        keyFn: (item) => item.name,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (ee: ExecutionEnvironment) => deleteExecutionEnvironment(ee),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deleteExecutionEnvironment(ee: ExecutionEnvironment) {
  return requestDelete(hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/`);
}
