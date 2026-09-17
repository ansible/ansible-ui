import { ITableColumn, usePageDialog } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useEdaBulkActionDialog } from '../../common/useEdaBulkActionDialog';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import {
  ClearLogsActivation,
  ClearLogsConfirmationDialog,
} from '../components/ClearLogsConfirmationDialog';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface ClearLogsResponse {
  deleted: number;
}

interface ClearLogsRequest {
  before_date: string;
}

export function useClearLogsDialog() {
  const { t } = useTranslation();
  const [_, setDialog] = usePageDialog();
  const postRequest = usePostRequest<ClearLogsRequest, ClearLogsResponse>();
  const openProgressDialog = useEdaBulkActionDialog<ClearLogsActivation>();

  const actionColumns = useMemo<ITableColumn<ClearLogsActivation>[]>(
    () => [{ header: t('Name'), cell: (activation) => activation.name }],
    [t]
  );

  return useCallback(
    (activations: ReadonlyArray<Pick<EdaRulebookActivation, 'id' | 'name'>>) => {
      if (activations.length === 0) return;

      const sortedActivations = [...activations].sort((left, right) =>
        left.name.localeCompare(right.name)
      );
      const dialogActivations: ClearLogsActivation[] = sortedActivations.map((activation) => ({
        id: activation.id,
        name: activation.name,
      }));

      const closeDialog = () => setDialog(undefined);
      setDialog(
        <ClearLogsConfirmationDialog
          activations={dialogActivations}
          onClose={closeDialog}
          onConfirm={(beforeDate) => {
            openProgressDialog({
              title: t('Clearing logs'),
              description: t(
                'Removing stored logs. Activations continue running, and container logs are not affected.'
              ),
              processingText: t('Clearing logs'),
              items: dialogActivations,
              keyFn: (activation) => activation.id,
              actionColumns,
              isDanger: true,
              actionFn: async (activation, signal) => {
                const result = await postRequest(
                  edaAPI`/activations/${activation.id.toString()}/clear-logs/`,
                  { before_date: beforeDate },
                  signal
                );
                return result;
              },
            });
          }}
        />
      );
    },
    [actionColumns, openProgressDialog, postRequest, setDialog, t]
  );
}
