import {
  PageFormSubmitHandler,
  PageFormTextInput,
  usePageAlertToaster,
  usePageDialogs,
} from '@ansible/ansible-ui-framework';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Tooltip,
} from '@patternfly/react-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { metricsAPI } from '../../../common/api/metrics-utils';
import { IAutomationDashboardView } from '../types';
import { getNumberInputError } from '../utils/numberInputValidation';
import {
  IJobTemplateModify,
  TEMPLATE_TIME_MAX_MINUTES,
  TEMPLATE_TIME_MIN_MINUTES,
} from '../views/useTemplateTimesSave';

type SetTemplateValuesFormValues = Partial<IJobTemplateModify>;

// PageForm insets its fields and footer by 24px but not its submit error alert, so the
// alert gets the same inset and some space before the first label. The alert is matched by
// the role PageForm's ErrorAlert sets, not by PatternFly's generated class name.
const SetTemplateValuesModalBody = styled(ModalBody)`
  padding-left: 0;

  & > form > [role='alert'] {
    margin-left: var(--pf-t--global--spacer--lg);
    margin-bottom: var(--pf-t--global--spacer--md);
  }
`;

// Same layout as the PageForm footer inside a dialog
const SetTemplateValuesFooter = styled(ModalFooter)`
  padding-inline-start: 0;
  padding-block-end: 0;
  margin-left: var(--pf-t--global--spacer--lg);
`;

/**
 * PageForm's own buttons cannot be disabled, so the footer is custom: like the delete
 * confirmations in the app, "Apply" stays disabled until the overwrite is confirmed, and
 * "Cancel" is disabled once the PATCH is sent, since the overwrite can no longer be stopped then.
 */
function SetTemplateValuesFormFooter(
  props: Readonly<{ isConfirmed: boolean; isSending: boolean; onCancel: () => void }>
) {
  const { t } = useTranslation();
  const { isSubmitting } = useFormState();
  return (
    <SetTemplateValuesFooter>
      <Tooltip
        content={t('Confirm the overwrite to apply the values.')}
        trigger={props.isConfirmed ? 'manual' : undefined}
      >
        <Button
          type="submit"
          data-testid="set-template-values-submit"
          isAriaDisabled={!props.isConfirmed}
          isDisabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {t('Apply to templates')}
        </Button>
      </Tooltip>
      <Button
        variant="link"
        data-testid="set-template-values-cancel"
        isDisabled={props.isSending}
        onClick={props.onCancel}
      >
        {t('Cancel')}
      </Button>
    </SetTemplateValuesFooter>
  );
}

function SetTemplateValuesDialog(
  props: Readonly<{
    onApplied: (updated: number | undefined, values: SetTemplateValuesFormValues) => void;
    waitForPendingSaves: () => Promise<void>;
  }>
) {
  const { onApplied, waitForPendingSaves } = props;
  const { t } = useTranslation();
  const { popDialog } = usePageDialogs();
  const patchRequest = usePatchRequest<SetTemplateValuesFormValues, { updated?: number } | null>();
  const title = t('Set template values');
  const [isConfirmed, setIsConfirmed] = useState(false);
  // While waiting for table saves the dialog can still be closed, which cancels the apply.
  // Once the PATCH is sent, closing is ignored: it could no longer stop the overwrite.
  const [isSending, setIsSending] = useState(false);
  const isSendingRef = useRef(false);
  const isClosedRef = useRef(false);
  const closeDialog = () => {
    if (isSendingRef.current) return;
    isClosedRef.current = true;
    popDialog();
  };

  // Limits are validated here instead of via min/max, because PageFormTextInput silently
  // clamps out-of-range numbers to min/max and so would never show a validation message
  const validateMinutes = (value: unknown) => {
    if (value === null || value === undefined || value === '') return undefined; // isRequired handles this
    return getNumberInputError(
      value,
      { min: TEMPLATE_TIME_MIN_MINUTES, max: TEMPLATE_TIME_MAX_MINUTES, isInteger: true },
      t
    );
  };

  // A failed PATCH throws, so the form shows the error and the dialog stays open
  const onSubmit: PageFormSubmitHandler<SetTemplateValuesFormValues> = async (data) => {
    // Apply is disabled until confirmed; this also covers any other way the form is submitted
    if (!isConfirmed) return;
    // Let in-flight table edits land first, otherwise they would overwrite the bulk values
    await waitForPendingSaves();
    if (isClosedRef.current) return;
    isSendingRef.current = true;
    setIsSending(true);
    try {
      const response = await patchRequest(metricsAPI`/dashboard_reports/template_metadata/`, data);
      popDialog();
      // Guard against a 204 or non-JSON reply, which usePatchRequest returns as null or a Blob
      onApplied(typeof response?.updated === 'number' ? response.updated : undefined, data);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
    }
  };

  return (
    <Modal
      ouiaId={title}
      isOpen
      // Without onClose the X button is hidden and Escape is ignored while the PATCH is sent
      onClose={isSending ? undefined : closeDialog}
      variant={ModalVariant.small}
      aria-label={title}
      position={'top'}
    >
      <ModalHeader
        title={title}
        description={t(
          'Set the same effort estimates for all templates. Individual values can be adjusted in the table.'
        )}
      />
      <SetTemplateValuesModalBody>
        <AwxPageForm<SetTemplateValuesFormValues>
          singleColumn
          disablePadding
          disableSubmitOnEnter
          onSubmit={onSubmit}
          footer={
            <SetTemplateValuesFormFooter
              isConfirmed={isConfirmed}
              isSending={isSending}
              onCancel={closeDialog}
            />
          }
          defaultValue={{}}
        >
          <PageFormTextInput<SetTemplateValuesFormValues>
            name={'time_taken_manually_execute_minutes'}
            id={'set-template-values-manual-execution-time'}
            type={'number'}
            label={t('Time taken to manually execute (min)')}
            labelHelp={t('Time taken to manually execute the job template.')}
            validate={validateMinutes}
            isRequired
          />
          <PageFormTextInput<SetTemplateValuesFormValues>
            name={'time_taken_create_automation_minutes'}
            id={'set-template-values-automation-development-time'}
            type={'number'}
            label={t('Time taken to create automation (min)')}
            labelHelp={t(
              'Time taken to create the automation for the job template. This is used to calculate the total time spent on automation, which includes both the time taken to create the automation and the time taken to execute it.'
            )}
            helperText={t(
              'Used in calculations when "Include time taken to create automation in calculations" is enabled.'
            )}
            validate={validateMinutes}
            isRequired
          />
          <Checkbox
            id="set-template-values-confirm"
            data-testid="set-template-values-confirm"
            label={t(
              'Yes, I confirm that I want to overwrite the values of all templates, including templates hidden by the current filters.'
            )}
            isChecked={isConfirmed}
            onChange={(_event, checked) => setIsConfirmed(checked)}
          />
        </AwxPageForm>
      </SetTemplateValuesModalBody>
    </Modal>
  );
}

export function useSetTemplateValuesDialog(
  refresh: IAutomationDashboardView['refresh'],
  templateTimes: Readonly<{
    /** Waits for per-template table saves, so they cannot overwrite the bulk values. */
    waitForPendingSaves: () => Promise<void>;
    /** Shows the bulk values in the table right away and drops local table edits. */
    applyBulkValues: (values: SetTemplateValuesFormValues) => void;
  }>
) {
  const { waitForPendingSaves, applyBulkValues } = templateTimes;
  const { t } = useTranslation();
  const { pushDialog } = usePageDialogs();
  // Dialogs render outside PageAlertToasterProvider, so alerts must be raised from here
  const alertToaster = usePageAlertToaster();

  const onApplied = useCallback(
    async (updated: number | undefined, values: SetTemplateValuesFormValues) => {
      alertToaster.addAlert({
        variant: 'success',
        // Phrased without a plural noun, since the count can be 1
        title:
          updated === undefined
            ? t('Template values applied.')
            : t('Template values applied. Updated templates: {{updated}}', { updated }),
        timeout: 2000,
      });
      // Right away, so the table shows the new values and later cell edits are not wiped
      applyBulkValues(values);

      // Reload the report and its details; a failure here does not undo the save.
      try {
        await refresh();
      } catch {
        alertToaster.addAlert({
          variant: 'warning',
          title: t('Update saved but failed to refresh view.'),
          timeout: 5000,
        });
      }
    },
    [alertToaster, applyBulkValues, refresh, t]
  );

  // The pushed dialog element keeps the props it was created with, so it reads the latest
  // onApplied through a ref; otherwise it would call a refresh from before it was opened.
  const onAppliedRef = useRef(onApplied);
  useEffect(() => {
    onAppliedRef.current = onApplied;
  });

  return useCallback(
    () =>
      pushDialog(
        <SetTemplateValuesDialog
          onApplied={(updated, values) => void onAppliedRef.current(updated, values)}
          waitForPendingSaves={waitForPendingSaves}
        />
      ),
    [pushDialog, waitForPendingSaves]
  );
}
