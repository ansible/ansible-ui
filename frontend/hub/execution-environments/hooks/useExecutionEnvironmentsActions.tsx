import { ButtonVariant } from '@patternfly/react-core';
import { PlusIcon, TrashIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  compareStrings,
  useBulkConfirmation,
} from '../../../../framework';
import { postRequest, requestDelete, requestGet } from '../../../common/crud/Data';
import { SigningServiceResponse } from '../../api-schemas/generated/SigningServiceResponse';
import { hubAPI, pulpAPI } from '../../api/utils';
import { HubContext, useHubContext } from '../../useHubContext';
import { PulpItemsResponse } from '../../usePulpView';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';

export function useExecutionEnvironmentsActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const syncExecutionEnvironments = useSyncExecutionEnvironments(callback);
  const signExecutionEnvironments = useSignExecutionEnvironments(callback);

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
          context.hasPermission('container.change_containernamespace') &&
          context.hasPermission('container.namespace_change_containerdistribution')
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
        actionButtonText: t('Delete execution environments', { count: ees.length }),
        items: ees.sort((l, r) => compareStrings(l.name || '', r.name || '')),
        keyFn: (item) => item.name,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (ee, signal) => deleteExecutionEnvironment(ee, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

async function deleteExecutionEnvironment(ee: ExecutionEnvironment, signal: AbortSignal) {
  return requestDelete(hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/`, signal);
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
        items: ees.sort((l, r) => compareStrings(l.name || '', r.name || '')),
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
  const context = useHubContext();

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
        items: ees.sort((l, r) => compareStrings(l.name || '', r.name || '')),
        keyFn: (item) => item.name,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (ee: ExecutionEnvironment) => signExecutionEnvironment(ee, context, t),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t, context]
  );
}

async function signExecutionEnvironment(
  ee: ExecutionEnvironment,
  context: HubContext,
  t: TFunction<'translation', undefined>
) {
  if (
    ee.pulp?.repository?.remote &&
    Object.keys(ee.pulp?.repository?.remote?.last_sync_task || {}).length == 0
  ) {
    throw new Error(t`Container must be synchronized with remote repository first.`);
  }

  const signingServiceName = context.settings.GALAXY_CONTAINER_SIGNING_SERVICE;
  const url = pulpAPI`/signing-services/?name=${signingServiceName}`;
  const signingServiceList: PulpItemsResponse<SigningServiceResponse> = await requestGet(url);
  const signingService = signingServiceList?.results?.[0].pulp_href;

  const containerId = ee.pulp?.repository?.id || '';
  const pulp_type = getContainerPulpType(ee);

  const postObj: { future_base_path?: string; manifest_signing_service: string } = {
    manifest_signing_service: signingService,
  };
  if (pulp_type == 'container') {
    postObj.future_base_path = ee.pulp?.distribution?.base_path;
  }

  await postRequest(pulpAPI`/repositories/container/${pulp_type}/${containerId}/sign/`, postObj);
}

export function getContainerPulpType(item: ExecutionEnvironment) {
  const pulp_types = item.pulp?.repository?.pulp_type.split('.');
  if (pulp_types && pulp_types.length > 1) {
    return pulp_types[1];
  } else {
    return '';
  }
}
