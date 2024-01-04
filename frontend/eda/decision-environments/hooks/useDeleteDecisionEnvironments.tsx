import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings } from '../../../../framework';
import { requestDelete } from '../../../common/crud/Data';
import { idKeyFn } from '../../../common/utils/nameKeyFn';
import { InUseResources } from '../../common/EdaResourcesComon';
import { edaAPI } from '../../common/eda-utils';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import {
  useDecisionEnvironmentColumns,
  useDecisionEnvironmentsColumns,
} from './useDecisionEnvironmentColumns';

export function useDeleteDecisionEnvironments(
  onComplete: (decisionEnvironments: EdaDecisionEnvironment[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useDecisionEnvironmentsColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaDecisionEnvironment>();
  return useCallback(
    async (decisionEnvironments: EdaDecisionEnvironment[]) => {
      const inUseDes = await InUseResources(
        decisionEnvironments,
        edaAPI`/activations/?decision_environment_id=`
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
        actionFn: (decisionEnvironment, signal) => {
          const url = edaAPI`/decision-environments/${decisionEnvironment.id.toString()}/`;
          return requestDelete(url + forceParameter, signal);
        },
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
  const bulkAction = useEdaBulkConfirmation<EdaDecisionEnvironmentRead>();
  return useCallback(
    async (decisionEnvironments: EdaDecisionEnvironmentRead[]) => {
      const inUseDes = await InUseResources(
        decisionEnvironments,
        edaAPI`/activations/?decision_environment_id=`
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
        actionFn: (decisionEnvironment, signal) => {
          const url = edaAPI`/decision-environments/${decisionEnvironment.id.toString()}/`;
          return requestDelete(url + forceParameter, signal);
        },
      });
    },
    [actionColumns, bulkAction, confirmationColumns, onComplete, t]
  );
}
