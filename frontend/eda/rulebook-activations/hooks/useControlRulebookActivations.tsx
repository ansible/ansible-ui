import { AlertProps } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, usePageAlertToaster } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';

export function useEnableRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<undefined, undefined>();
  const alertToaster = usePageAlertToaster();
  return useCallback(
    async (rulebookActivations: EdaRulebookActivation[]) => {
      await Promise.allSettled(
        rulebookActivations.map(async (activation) => {
          const alert: AlertProps = {
            variant: 'success',
            title: `${activation.name} ${t('enabled')}.`,
            timeout: 5000,
          };
          await postRequest(
            edaAPI`/activations/${activation?.id ? activation?.id.toString() : ''}/enable/`,
            undefined
          )
            .then(() => alertToaster.addAlert(alert))
            .catch(() => {
              alertToaster.addAlert({
                variant: 'danger',
                title: `${t('Failed to enable')} ${activation.name}`,
                timeout: 5000,
              });
            });
        })
      );
      onComplete(rulebookActivations);
    },
    [alertToaster, onComplete, postRequest, t]
  );
}

export function useDisableRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
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
          postRequest(edaAPI`/activations/${rulebookActivation.id.toString()}/disable/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}

export function useRestartRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
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
          postRequest(edaAPI`/activations/${rulebookActivation.id.toString()}/restart/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}
