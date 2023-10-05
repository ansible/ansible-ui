import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon } from '@patternfly/react-icons';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IPageAction, PageActionSelection, PageActionType } from '../../../../framework';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { TrashIcon } from '@patternfly/react-icons';
import { useHubContext } from '../../useHubContext';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete, postRequest } from '../../../common/crud/Data';
import { hubAPI } from '../../api/utils';

export function useExecutionEnvironmentsActions() {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments();
  const syncExecutionEnvironments = useSyncExecutionEnvironments();
  const signExecutionEnvironments = useSignExecutionEnvironments();

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
        label: t('Sync selected environments'),
        onClick: syncExecutionEnvironments,
        isDisabled:
          context.hasPermission('container.container.change_containernamespace') &&
          context.hasPermission(
            'container.container.container.namespace_change_containerdistribution'
          )
            ? ''
            : t`You do not have rights to this operation`,
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        label: t('Sign selected environments'),
        onClick: signExecutionEnvironments,
        isDisabled:
          context.hasPermission('container.change_containernamespace') &&
          context.featureFlags.container_signing
            ? ''
            : t`You do not have rights to this operation`,
      },
    ],
    [t, context, deleteExecutionEnvironments, syncExecutionEnvironments, signExecutionEnvironments]
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
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} execution environments.',
          {
            count: ees.length,
          }
        ),
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

export function useSyncExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<ExecutionEnvironment>();
  return useCallback(
    (ees: ExecutionEnvironment[]) => {
      bulkAction({
        title: t('Sync environments', { count: ees.length }),
        confirmText: t(
          'Yes, I confirm that I want to sync these {{count}} execution environments.',
          {
            count: ees.length,
          }
        ),
        actionButtonText: t('Sync execution environments', { count: ees.length }),
        items: ees.sort((l, r) => compareStrings(l.name || '' + l.name, r.name || '' + l.name)),
        keyFn: (item) => item.name,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (ee: ExecutionEnvironment) => syncExecutionEnvironment(ee),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function syncExecutionEnvironment(ee: ExecutionEnvironment) {
  return postRequest(
    hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/_content/sync/`,
    {}
  );
}

export function useSignExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<ExecutionEnvironment>();
  return useCallback(
    (ees: ExecutionEnvironment[]) => {
      bulkAction({
        title: t('Sign environments', { count: ees.length }),
        confirmText: t(
          'Yes, I confirm that I want to sign these {{count}} execution environments.',
          {
            count: ees.length,
          }
        ),
        actionButtonText: t('Sign execution environments', { count: ees.length }),
        items: ees.sort((l, r) => compareStrings(l.name || '' + l.name, r.name || '' + l.name)),
        keyFn: (item) => item.name,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (ee: ExecutionEnvironment) => signExecutionEnvironment(ee),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function signExecutionEnvironment(ee: ExecutionEnvironment) {
  /*return postRequest(
    hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/_content/sync/`,
    {}
  );*/
}
