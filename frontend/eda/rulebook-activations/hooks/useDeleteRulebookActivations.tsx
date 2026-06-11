import { compareStrings } from '@ansible/ansible-ui-framework';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { TFunction } from 'i18next';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';

function deleteMessages(rulebookActivations: EdaRulebookActivation[], t: TFunction): string {
  const nameList = rulebookActivations
    .filter((activation) => activation.status === StatusEnum.WorkersOffline)
    .map((activation) => activation.name)
    .join(', ');

  const count = rulebookActivations.filter(
    (activation) => activation.status === StatusEnum.WorkersOffline
  )?.length;

  const oneMessage: string = t(
    `${nameList} activation has workers offline. Deleting it might orphan pods and leave the existing activation running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activation is no longer running.`
  );
  const multiMessage: string = t(
    `${nameList} activations have workers offline. Deleting them might orphan pods and leave the existing activations running. Before deleting, we recommend contacting your admin to recover the offline workers or confirm the previous activations are no longer running.`
  );
  return count > 1 ? multiMessage : oneMessage;
}

export function useDeleteRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns({ disableLinks: true });
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Permanently delete rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Delete rulebook activations', { count: rulebookActivations.length }),
        items: [...rulebookActivations].sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation, signal) =>
          requestDelete(edaAPI`/activations/${rulebookActivation.id.toString()}/`, signal),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

export function useDeleteRulebookActivationsWithWarning(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns({ disableLinks: true });
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Permanently delete rulebook activations', { count: rulebookActivations.length }),
        alertPrompts: [deleteMessages(rulebookActivations, t)],
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Delete rulebook activations', { count: rulebookActivations.length }),
        items: [...rulebookActivations].sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation, signal) =>
          requestDelete(
            edaAPI`/activations/${rulebookActivation.id.toString()}/?force=true`,
            signal
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
