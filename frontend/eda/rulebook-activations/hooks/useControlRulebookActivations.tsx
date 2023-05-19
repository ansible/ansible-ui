import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';

export function useEnableRulebookActivations(
  onComplete: (rulebookActivations: (EdaRulebookActivation | EdaRulebookActivation)[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Enable rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to enable these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Enable rulebookActivations', { count: rulebookActivations.length }),
        items: rulebookActivations.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/enable/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}

export function useDisableRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Disable rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to disable these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Disable rulebook activations', { count: rulebookActivations.length }),
        items: rulebookActivations.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/disable/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}

export function useRestartRulebookActivations(
  onComplete: (rulebookActivations: (EdaRulebookActivation | EdaRulebookActivation)[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();
  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      bulkAction({
        title: t('Restart rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to restart these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Restart rulebook activations', { count: rulebookActivations.length }),
        items: rulebookActivations.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: (item) => item?.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(`${API_PREFIX}/activations/${rulebookActivation.id}/restart/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}
