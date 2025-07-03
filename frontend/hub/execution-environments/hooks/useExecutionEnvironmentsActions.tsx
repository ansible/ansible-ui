import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  compareStrings,
  usePageDialog,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useClearCache } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import {
  Button,
  ButtonVariant,
  ClipboardCopy,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
  Modal,
  ModalVariant,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { CheckIcon, PlusCircleIcon, TrashIcon } from '@patternfly/react-icons';
import { TFunction } from 'i18next';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI, pulpAPI } from '../../common/api/formatPath';
import { hubAPIDelete, hubAPIPost } from '../../common/api/hub-api-utils';
import { AAPDocsURL } from '../../common/constants';
import { ExternalLink } from '../../common/ExternalLink';
import { useHubBulkConfirmation } from '../../common/useHubBulkConfirmation';
import { HubContext, useHubContext } from '../../common/useHubContext';
import { PulpItemsResponse } from '../../common/useHubView';
import { useCanSignEE } from '../../common/utils/canSign';
import { SigningServiceResponse } from '../../interfaces/generated/SigningServiceResponse';
import { HubRoute } from '../../main/HubRoutes';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';

export function useEmptyEEsActions() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const eePush = useEEPush();

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
        label: t('Push container images'),
        onClick: () => {
          eePush();
        },
      },
    ],
    [t, pageNavigate, eePush]
  );
}

export function useExecutionEnvironmentsActions(callback?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const deleteExecutionEnvironments = useDeleteExecutionEnvironments(callback);
  const signExecutionEnvironments = useSignExecutionEnvironments(callback);
  const canSignEE = useCanSignEE();
  const emptyActions = useEmptyEEsActions();

  return useMemo<IPageAction<ExecutionEnvironment>[]>(
    () => [
      ...emptyActions,
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: CheckIcon,
        label: t('Sign execution environments'),
        onClick: signExecutionEnvironments,
        isDisabled: canSignEE ? '' : t`You do not have rights to this operation`,
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Multiple,
        icon: TrashIcon,
        label: t('Delete execution environments'),
        onClick: deleteExecutionEnvironments,
        isDanger: true,
      },
    ],
    [t, signExecutionEnvironments, canSignEE, deleteExecutionEnvironments, emptyActions]
  );
}

export function useDeleteExecutionEnvironments(onComplete?: (ees: ExecutionEnvironment[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useExecutionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useHubBulkConfirmation<ExecutionEnvironment>();
  const pageNavigate = usePageNavigate();
  const { clearCacheByKey } = useClearCache();

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
        actionFn: (ee, signal) =>
          hubAPIDelete(
            hubAPI`/v3/plugin/execution-environments/repositories/${ee.name}/`,
            signal
          ).then(() => {
            clearCacheByKey(hubAPI`/v3/plugin/execution-environments/repositories`);
            return pageNavigate(HubRoute.ExecutionEnvironments);
          }),
      });
    },
    [bulkAction, t, confirmationColumns, actionColumns, onComplete, clearCacheByKey, pageNavigate]
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

export function useEEPush() {
  const [_, setDialog] = usePageDialog();
  const onClose = useCallback(() => setDialog(undefined), [setDialog]);

  return () => {
    setDialog(<EEPushModal onClose={onClose} />);
  };
}

function EEPushModal(props: { onClose: () => void }) {
  const { onClose } = props;
  const { t } = useTranslation();

  const host = window.location.host;
  const [tlsVerify, setTlsVerify] = useState(window.location.protocol === 'https:');
  const name = 'example';
  const containerURL = `${host}/${name}:latest`;

  const code = `podman login --tls-verify=${tlsVerify.toString()} ${host}
podman image tag ${name} ${containerURL}
podman push --tls-verify=${tlsVerify.toString()} ${containerURL}
`;

  return (
    <Modal
      aria-label={t(`Push container images`)}
      isOpen
      onClose={onClose}
      variant={ModalVariant.medium}
      tabIndex={0}
    >
      <ModalHeader title={t(`Push container images`)} />
      <ModalBody style={{ overflow: 'hidden' }}>
        <Stack hasGutter>
          <ToggleGroup isCompact aria-label={t(`Toggle between HTTPS and HTTP`)}>
            <ToggleGroupItem
              text={t(`Valid HTTPS`)}
              isSelected={tlsVerify}
              onChange={() => setTlsVerify(true)}
            />
            <ToggleGroupItem
              text={t(`HTTP or self-signed HTTPS`)}
              isSelected={!tlsVerify}
              onChange={() => setTlsVerify(false)}
            />
          </ToggleGroup>
          <ClipboardCopy isCode isReadOnly isExpanded variant="expansion">
            {code}
          </ClipboardCopy>
        </Stack>
      </ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="secondary" onClick={onClose}>
          {t(`Close`)}
        </Button>
        <ExternalLink key="docs" href={AAPDocsURL}>{t`Documentation`}</ExternalLink>
      </ModalFooter>
    </Modal>
  );
}
