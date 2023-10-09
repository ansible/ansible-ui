import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, useBulkConfirmation } from '../../../../../framework';
import { requestDelete } from '../../../../common/crud/Data';
import { idKeyFn } from '../../../../common/utils/nameKeyFn';
import { API_PREFIX } from '../../../constants';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../../interfaces/EdaDecisionEnvironment';
import {
  useDecisionEnvironmentColumns,
  useDecisionEnvironmentsColumns,
} from './useDecisionEnvironmentColumns';
import { InUseResources } from '../../../common/EdaResourcesComon';

export function useDeleteDecisionEnvironments(
  onComplete: (decisionEnvironments: EdaDecisionEnvironment[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useDecisionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaDecisionEnvironment>();
  return useCallback(
    async (decisionEnvironments: EdaDecisionEnvironment[]) => {
      const inUseDes = await InUseResources(
        decisionEnvironments,
        `${API_PREFIX}/activations/?decision_environment_id=`
      );
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following decision environments are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

      bulkAction({
        title: t('Permanently delete decision environments', {
          count: decisionEnvironments.length,
        }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} decision environments.',
          {
            count: decisionEnvironments.length,
          }
        ),
        actionButtonText: t('Delete decision environments', { count: decisionEnvironments.length }),
        items: decisionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        alertPrompts: inUseMessage,
        actionFn: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          requestDelete(
            `${API_PREFIX}/decision-environments/${decisionEnvironment.id}/${forceParameter}`
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}

export function useDeleteDecisionEnvironment(
  onComplete: (decisionEnvironments: EdaDecisionEnvironmentRead[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useDecisionEnvironmentColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useBulkConfirmation<EdaDecisionEnvironmentRead>();
  return useCallback(
    async (decisionEnvironments: EdaDecisionEnvironmentRead[]) => {
      const inUseDes = await InUseResources(
        decisionEnvironments,
        `${API_PREFIX}/activations/?decision_environment_id=`
      );
      const inUseMessage =
        inUseDes && inUseDes.length > 0
          ? [t(`The following decision environments are in use: ${inUseDes.join()}`)]
          : [];
      const forceParameter = inUseMessage.length > 0 ? '?force=true' : '';

      bulkAction({
        title: t('Permanently delete decision environments', {
          count: decisionEnvironments.length,
        }),
        confirmText: t(
          'Yes, I confirm that I want to delete these {{count}} decision environments.',
          {
            count: decisionEnvironments.length,
          }
        ),
        actionButtonText: t('Delete decision environments', { count: decisionEnvironments.length }),
        items: decisionEnvironments.sort((l, r) => compareStrings(l.name, r.name)),
        keyFn: idKeyFn,
        isDanger: true,
        confirmationColumns,
        actionColumns,
        onComplete,
        alertPrompts: inUseMessage,
        actionFn: (decisionEnvironment: EdaDecisionEnvironmentRead) =>
          requestDelete(
            `${API_PREFIX}/decision-environments/${decisionEnvironment.id}/${forceParameter}`
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
