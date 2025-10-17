import { compareStrings, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { edaAPI, hasCopyNamePattern } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';
import { TFunction } from 'i18next';
import { useEdaWarningDialog } from '../components/EdaWarningDialog';
import { StatusEnum } from '../../interfaces/generated/eda-api';

export function useEnableRulebookActivations(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const postRequest = usePostRequest<undefined, undefined>();
  const parseError = useEdaErrorMessageParser();
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
            .catch((err: Error) => {
              const errorResults = parseError(err);
              alertToaster.addAlert({
                variant: 'danger',
                title: `${t('Failed to enable')} ${activation.name}`,
                children: (
                  <>{errorResults.parsedErrors.map((errorResult) => errorResult.message)}</>
                ),
                timeout: 5000,
              });
            });
        })
      );
      onComplete(rulebookActivations);
    },
    [alertToaster, onComplete, postRequest, parseError, t]
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
      const sortedActivations = rulebookActivations;
      sortedActivations.sort((l, r) => compareStrings(l.name, r.name));
      bulkAction({
        title: t('Disable rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to disable these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Disable rulebook activations', { count: rulebookActivations.length }),
        items: sortedActivations,
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

function restartMessages(rulebookActivations: EdaRulebookActivation[], t: TFunction): string {
  const nameList = rulebookActivations
    .filter((activation) => activation.status === StatusEnum.WorkersOffline)
    .map((activation) => activation.name)
    .join(', ');

  const count = rulebookActivations.filter(
    (activation) => activation.status === StatusEnum.WorkersOffline
  )?.length;

  const oneMessage: string = t(
    `${nameList} activation has workers offline. Restarting it might orphan pods and leave the existing activation running. Before restarting, we recommend contacting your admin to recover the offline workers or confirm the previous activation is no longer running and then restart it to continue executing in a different node.`
  );
  const multiMessage: string = t(
    `${nameList} activations have workers offline. Restarting them might orphan pods and leave the existing activations running. Before restarting, we recommend contacting your admin to recover the offline workers or confirm the previous activations are no longer running and then restart them to continue executing in different nodes.`
  );
  return count > 1 ? multiMessage : oneMessage;
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
      const sortedActivations = rulebookActivations;
      sortedActivations.sort((l, r) => compareStrings(l.name, r.name));
      bulkAction({
        title: t('Restart rulebook activations', { count: rulebookActivations.length }),
        confirmText: t(
          'Yes, I confirm that I want to restart these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Restart rulebook activations', { count: rulebookActivations.length }),
        items: sortedActivations,
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

function enableMessage(activation: EdaRulebookActivation) {
  const originalName = activation?.name.substring(0, activation?.name.length - 10);

  return (
    <Trans>
      {<strong>{activation.name}</strong>} was copied from {<strong>{originalName}</strong>}{' '}
      rulebook activation. If the rulebook activations are identical, enabling{' '}
      {<b>{activation.name}</b>} may fail or result in duplicate jobs and other complications.
    </Trans>
  );
}

function enableMessages(rulebookActivations: EdaRulebookActivation[], t: TFunction): string {
  const nameList = rulebookActivations
    .filter((activation) => hasCopyNamePattern(activation.name))
    .map((activation) => activation.name)
    .join(', ');
  const originalNameList = rulebookActivations
    .filter((activation) => hasCopyNamePattern(activation.name))
    .map((activation) => activation?.name.substring(0, activation?.name.length - 10))
    .join(', ');
  const copyCount = rulebookActivations.filter((activation) =>
    hasCopyNamePattern(activation.name)
  )?.length;

  const oneMessage: string =
    t(`${nameList} was copied from ${originalNameList} rulebook activation. If the rulebook activations
      are identical, enabling
      ${nameList} may fail or result in duplicate jobs and other complications.`);
  const multiMessage: string =
    t(`${nameList} were copied from ${originalNameList} rulebook activations. If the rulebook activations
      are identical, enabling ${nameList} may fail or result in duplicate jobs and other complications.`);
  return copyCount > 1 ? multiMessage : oneMessage;
}

export function useEnableRulebookActivationsWithWarning(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();

  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      const sortedActivations = rulebookActivations;
      sortedActivations.sort((l, r) => compareStrings(l.name, r.name));
      bulkAction({
        title: t('Enable rulebook activations', { count: rulebookActivations.length }),
        alertPrompts: [
          enableMessages(rulebookActivations, t) +
            '\n' +
            t(
              `Note: This warning is triggered if a copied rulebook activation's default name was not edited. If this rulebook activation is no longer identical to the original, update its name to clear this warning.`
            ),
        ],
        confirmText: t(
          'Yes, I confirm that I want to enable these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Enable rulebook activations', { count: rulebookActivations.length }),
        items: sortedActivations,
        keyFn: (item) => item?.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(edaAPI`/activations/${rulebookActivation.id.toString()}/enable/`, undefined),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}

export function useEnableRulebookActivationWithWarning(
  onConfirm: (item: EdaRulebookActivation) => Promise<unknown>,
  onComplete?: (items: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const edaWarningDialog = useEdaWarningDialog<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();

  return useCallback(
    (rulebookActivation: EdaRulebookActivation) => {
      edaWarningDialog({
        title: t('Enable rulebook activation'),
        messages: [
          enableMessage(rulebookActivation),
          <Trans key={'note'}>
            <strong>Note:</strong> This warning is triggered if the copied rulebook activation&#39;s
            default name is not edited. If this rulebook activation is no longer identical to the
            original, update its name to clear this warning.
          </Trans>,
        ],
        actionButtonText: t('Enable rulebook activation'),
        items: [rulebookActivation],
        onComplete,
        onConfirm: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(edaAPI`/activations/${rulebookActivation.id.toString()}/enable/`, undefined),
      });
    },
    [edaWarningDialog, t, onComplete, postRequest]
  );
}

export function useRestartRulebookActivationsWithWarning(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const confirmationColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [confirmationColumns[0]], [confirmationColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();

  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      const sortedActivations = rulebookActivations;
      sortedActivations.sort((l, r) => compareStrings(l.name, r.name));
      bulkAction({
        title: t('Restart rulebook activations', { count: rulebookActivations.length }),
        alertPrompts: [restartMessages(rulebookActivations, t)],
        confirmText: t(
          'Yes, I confirm that I want to restart these {{count}} rulebook activations.',
          {
            count: rulebookActivations.length,
          }
        ),
        actionButtonText: t('Restart rulebook activations', { count: rulebookActivations.length }),
        items: sortedActivations,
        keyFn: (item) => item?.id,
        confirmationColumns,
        actionColumns,
        onComplete,
        actionFn: (rulebookActivation: EdaRulebookActivation) =>
          postRequest(
            edaAPI`/activations/${rulebookActivation.id.toString()}/restart/?force=true`,
            undefined
          ),
      });
    },
    [actionColumns, bulkAction, confirmationColumns, postRequest, onComplete, t]
  );
}
