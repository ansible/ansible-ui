import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
  usePageAlertToaster,
  usePageDialog,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { Button, Modal, ModalFooter, ModalHeader, ModalVariant } from '@patternfly/react-core';
import { CubesIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { useEdaActiveUser } from '../../common/useEdaActiveUser';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { useActivationHistoryColumns } from '../hooks/useActivationHistoryColumns';
import { useActivationHistoryFilters } from '../hooks/useActivationHistoryFilters';

interface ClearLogsConfirmationDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

function ClearLogsConfirmationDialog(props: Readonly<ClearLogsConfirmationDialogProps>) {
  const { t } = useTranslation();

  return (
    <Modal aria-label={t('Clear logs')} isOpen onClose={props.onClose} variant={ModalVariant.small}>
      <ModalHeader
        title={t('Clear logs')}
        titleIconVariant="warning"
        description={t(
          'Are you sure you want to clear all logs for this activation? This action is irreversible.'
        )}
      />
      <ModalFooter>
        <Button variant="danger" onClick={props.onConfirm}>
          {t('Clear logs')}
        </Button>
        <Button variant="link" onClick={props.onClose}>
          {t('Cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export function RulebookActivationHistory() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();
  const [_, setDialog] = usePageDialog();
  const { activeEdaUser } = useEdaActiveUser();

  const toolbarFilters = useActivationHistoryFilters();

  const tableColumns = useActivationHistoryColumns();
  const view = useEdaView<EdaActivationInstance>({
    url: edaAPI`/activations/${params?.id || ''}/instances/`,
    toolbarFilters,
    tableColumns,
  });

  const clearLogs = useCallback(async () => {
    const activationId = params?.id;
    if (!activationId) return;
    try {
      const result = await postRequest<{ deleted: number }>(
        edaAPI`/activations/${activationId}/clear-logs/`,
        {}
      );
      alertToaster.addAlert({
        variant: 'success',
        title: t('Cleared {{count}} log records.', { count: result.deleted }),
        timeout: 5000,
      });
    } catch {
      alertToaster.addAlert({
        variant: 'danger',
        title: t('Failed to clear logs'),
        timeout: 5000,
      });
    }
  }, [params?.id, alertToaster, t]);

  const confirmClearLogs = useCallback(() => {
    const closeDialog = () => setDialog(undefined);
    setDialog(
      <ClearLogsConfirmationDialog
        onClose={closeDialog}
        onConfirm={() => {
          closeDialog();
          void clearLogs();
        }}
      />
    );
  }, [clearLogs, setDialog]);

  const toolbarActions = useMemo<IPageAction<EdaActivationInstance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: TimesCircleIcon,
        label: t('Clear logs'),
        onClick: confirmClearLogs,
        isDisabled: activeEdaUser?.is_superuser
          ? undefined
          : t(
              'You do not have permission to clear logs. Please contact your system administrator if there is an issue with your access.'
            ),
        isDanger: true,
      },
    ],
    [activeEdaUser?.is_superuser, confirmClearLogs, t]
  );

  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading history')}
        emptyStateTitle={t('No activation history')}
        emptyStateIcon={CubesIcon}
        emptyStateDescription={t('No history for this rulebook activation')}
        {...view}
        defaultSubtitle={t('Rulebook Activation History')}
      />
    </PageLayout>
  );
}
