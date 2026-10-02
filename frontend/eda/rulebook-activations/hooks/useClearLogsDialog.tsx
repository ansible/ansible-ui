import { ITableColumn, usePageDialog } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { edaAPI } from '../../common/eda-utils';
import {
  ClearLogsTarget,
  ClearLogsTargetType,
  ClearLogsConfirmationDialog,
} from '../components/ClearLogsConfirmationDialog';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ClearLogsResponse {
  deleted: number;
}

interface ClearLogsRequest {
  before_date?: string;
}

type ClearLogsEndpointBuilder = (target: ClearLogsTarget) => string;

interface UseClearLogsDialogOptions {
  endpointBuilder?: ClearLogsEndpointBuilder;
  onComplete?: (successfulTargets: ClearLogsTarget[]) => void;
  targetType?: ClearLogsTargetType;
}

const activationEndpointBuilder: ClearLogsEndpointBuilder = (target) =>
  edaAPI`/activations/${target.id.toString()}/clear-logs/`;

export function useClearLogsDialog(options: Readonly<UseClearLogsDialogOptions> = {}) {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const postRequest = usePostRequest<ClearLogsRequest | undefined, ClearLogsResponse>();
  const openProgressDialog = useEdaBulkActionDialog<ClearLogsTarget>();
  const {
    endpointBuilder = activationEndpointBuilder,
    onComplete,
    targetType = 'activation',
  } = options;

  const actionColumns = useMemo<ITableColumn<ClearLogsTarget>[]>(
    () => [{ header: t('Name'), cell: (target) => target.name }],
    [t]
  );

  return useCallback(
    (targets: ReadonlyArray<ClearLogsTarget>) => {
      if (targets.length === 0) return;

      const sortedTargets = [...targets].sort((left, right) => left.name.localeCompare(right.name));
      const dialogTargets: ClearLogsTarget[] = sortedTargets.map((target) => ({
        id: target.id,
        name: target.name,
      }));

      const closeDialog = () => setDialog(undefined);
      setDialog(
        <ClearLogsConfirmationDialog
          targets={dialogTargets}
          targetType={targetType}
          onClose={closeDialog}
          onConfirm={(beforeDate) => {
            openProgressDialog({
              title: t('Deleting logs'),
              description: t(
                'Deleting stored logs. Activations continue running, and container logs are not affected.'
              ),
              processingText: t('Deleting logs'),
              items: dialogTargets,
              keyFn: (target) => target.id,
              actionColumns,
              isDanger: true,
              actionFn: async (target, signal) => {
                const result = await postRequest(
                  endpointBuilder(target),
                  beforeDate ? { before_date: beforeDate } : undefined,
                  signal
                );
                return result;
              },
              onClose: (status, successfulTargets) => {
                if (status === 'success') {
                  onComplete?.(successfulTargets);
                }
              },
            });
          }}
        />
      );
    },
    [
      actionColumns,
      endpointBuilder,
      onComplete,
      openProgressDialog,
      postRequest,
      setDialog,
      t,
      targetType,
    ]
  );
}
