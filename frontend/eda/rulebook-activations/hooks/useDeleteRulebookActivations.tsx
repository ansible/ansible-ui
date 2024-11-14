import { compareStrings } from '@ansible/ansible-ui-framework';
import { requestDelete } from '@ansible/common-ui/crud/Data';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';

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
        items: rulebookActivations.sort((l, r) => compareStrings(l.name, r.name)),
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
