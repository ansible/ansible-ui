import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
  usePageAlertToaster,
} from '@ansible/ansible-ui-framework';
import { postRequest } from '@ansible/common-ui/crud/Data';
import { CubesIcon, TimesCircleIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { useActivationHistoryColumns } from '../hooks/useActivationHistoryColumns';
import { useActivationHistoryFilters } from '../hooks/useActivationHistoryFilters';

export function RulebookActivationHistory() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const alertToaster = usePageAlertToaster();

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
    if (
      !confirm(
        t('Are you sure you want to clear all logs for this activation? This action is irreversible.')
      )
    ) {
      return;
    }
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

  const toolbarActions = useMemo<IPageAction<EdaActivationInstance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        icon: TimesCircleIcon,
        label: t('Clear logs'),
        onClick: () => clearLogs(),
        isDanger: true,
      },
    ],
    [clearLogs, t]
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
