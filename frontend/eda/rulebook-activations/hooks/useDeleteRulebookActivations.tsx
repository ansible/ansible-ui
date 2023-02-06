import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { requestDelete } from '../../../Data';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';

export function useDeleteRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRulebookActivation>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Permanently delete rulebookActivations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} rulebookActivations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Delete rulebookActivations', { count: rulebookActivations.length }),
        items: rulebookActivations.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          requestDelete(`/eda/api/v1/activations/${rulebookActivation.id}`),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
