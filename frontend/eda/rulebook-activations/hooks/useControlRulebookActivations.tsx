import { compareStrings, ITableColumn, usePageAlertToaster } from '@ansible/ansible-ui-framework';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { AlertProps } from '@patternfly/react-core';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { edaAPI, hasCopyNamePattern } from '../../common/eda-utils';
import { useEdaErrorMessageParser } from '../../common/edaErrorAdapter';
import { useEdaBulkConfirmation } from '../../common/useEdaBulkConfirmation';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from './useRulebookActivationColumns';
import { TFunction } from 'i18next';
import { StatusEnum } from '../../interfaces/generated/eda-api';

const COPY_MARKER_LENGTH = ' @ hh:mm:ss'.length;

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

export function useEnableRulebookActivationsWithWarning(
  onComplete: (rulebookActivations: EdaRulebookActivation[]) => void
) {
  const { t } = useTranslation();
  const baseColumns = useRulebookActivationColumns();
  const actionColumns = useMemo(() => [baseColumns[0]], [baseColumns]);
  const bulkAction = useEdaBulkConfirmation<EdaRulebookActivation>();
  const postRequest = usePostRequest<undefined, undefined>();

  // Name column and Duplicate source column for the enable warning modal
  const confirmationColumns = useMemo<ITableColumn<EdaRulebookActivation>[]>(() => {
    const nameColumn = baseColumns.find((col) => col.header === t('Name'));
    return [
      ...(nameColumn ? [nameColumn] : []),
      {
        header: t('Duplicate source'),
        type: 'text',
        value: (activation) =>
          hasCopyNamePattern(activation.name)
            ? activation.name.substring(0, activation.name.length - COPY_MARKER_LENGTH)
            : '',
      },
    ];
  }, [baseColumns, t]);

  return useCallback(
    (rulebookActivations: EdaRulebookActivation[]) => {
      const sortedActivations = rulebookActivations;
      sortedActivations.sort((l, r) => compareStrings(l.name, r.name));
      bulkAction({
        title: t('Enable rulebook activations', { count: rulebookActivations.length }),
        prompt:
          rulebookActivations.length === 1 ? (
            <>
              {t(
                'You are attempting to enable a rulebook activation that may be a duplicate. If it is identical to the rulebook activation it was duplicated from, enabling it may fail or result in duplicate jobs and other complications.'
              )}
              <br />
              <br />
              {t(
                "Note: This warning is triggered if a duplicated rulebook activation's default name is not edited. If a rulebook activation is no longer identical to the original, update its name to clear this warning."
              )}
            </>
          ) : (
            <>
              {t(
                'Some or all of the rulebook activations you are attempting to enable may be duplicates. The table below lists all rulebook activations that will be enabled and also identifies rulebook activations that are duplicates by displaying its duplicate source. If a duplicate is identical to the rulebook activation it was duplicated from, enabling it may fail or result in duplicate jobs and other complications.'
              )}
              <br />
              <br />
              {t(
                "Note: This warning is triggered if a duplicated rulebook activation's default name is not edited. If a rulebook activation is no longer identical to the original, update its name to clear this warning."
              )}
            </>
          ),
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
