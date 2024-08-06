import { ButtonVariant } from '@patternfly/react-core';
import { CheckIcon, ExternalLinkAltIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  compareStrings,
  usePageNavigate,
} from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { hubAPIDelete, hubAPIPost } from '../../common/api/hub-api-utils';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { HubContext, useHubContext } from '../../common/useHubContext';
import { PulpItemsResponse } from '../../common/useHubView';
import { SigningServiceResponse } from '../../interfaces/generated/SigningServiceResponse';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';
import { AAPDocsURL } from '../../common/constants';

export function useExecutionEnvironmentsActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const context = useHubContext();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const signExecutionEnvironments = useSignExecutionEnvironments(callback);
  const pageNavigate = usePageNavigate();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PlusCircleIcon,
        label: t('Create execution environment'),
        onClick: () => {
          pageNavigate(HubRoute.CreateExecutionEnvironment);
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        variant: ButtonVariant.link,
        isPinned: true,
        icon: ExternalLinkAltIcon,
        label: t('Push container images'),
        onClick: () => {
          window.open(AAPDocsURL, '_blank');
        },
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: CheckIcon,
        label: t('Sign execution environments'),
        onClick: signExecutionEnvironments,
        isDisabled:
          context.hasPermission('container.change_containernamespace') &&
          context.featureFlags.container_signing
            ? ''
            : t`You do not have rights to this operation`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete execution environments'),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
        isDisabled: context.hasPermission('container.delete_containerrepository')
          ? ''
          : t`You do not have rights to this operation`,
      },
    ],
    [t, context, deleteExecutionEnvironments, signExecutionEnvironments, pageNavigate]
  );
}

export function useDeleteExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<ExecutionEnvironment>();
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
  return await hubAPIDelete(
    hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/`,
    signal
  );
}

export function useSyncExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<ExecutionEnvironment>();
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
  return hubAPIPost(
    hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/_content/sync/`,
    {}
  );
}

export function useSignExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<ExecutionEnvironment>();
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
    Object.keys(ee.pulp?.repository?.remote?.last_sync_task || {}).length === 0
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
  if (pulp_type === 'container') {
    postObj.future_base_path = ee.pulp?.distribution?.base_path;
  }

  await hubAPIPost(pulpAPI`/repositories/container/${pulp_type}/${containerId}/sign/`, postObj);
}

export function getContainerPulpType(item: ExecutionEnvironment) {
  const pulp_types = item.pulp?.repository?.pulp_type.split('.');
  if (pulp_types && pulp_types.length > 1) {
    return pulp_types[1];
  } else {
    return '';
  }
}
