import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageLayout,
  PageTable,
} from '@ansible/ansible-ui-framework';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { CubesIcon } from '@patternfly/react-icons';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useActivationHistoryColumns } from '../hooks/useActivationHistoryColumns';
import { useActivationHistoryFilters } from '../hooks/useActivationHistoryFilters';
import { useClearLogsDialog } from '../hooks/useClearLogsDialog';

export function RulebookActivationHistory() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { data: activation } = useGetItem<EdaRulebookActivation>(edaAPI`/activations/`, params?.id);
  const openClearLogsDialog = useClearLogsDialog();

  const toolbarFilters = useActivationHistoryFilters();

  const tableColumns = useActivationHistoryColumns();
  const view = useEdaView<EdaActivationInstance>({
    url: edaAPI`/activations/${params?.id || ''}/instances/`,
    toolbarFilters,
    tableColumns,
  });

  const confirmClearLogs = useCallback(() => {
    if (!params?.id) return;
    openClearLogsDialog([
      { id: Number(params.id), name: activation?.name ?? t('Rulebook activation') },
    ]);
  }, [activation?.name, openClearLogsDialog, params?.id, t]);

  const toolbarActions = useMemo<IPageAction<EdaActivationInstance>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.None,
        label: t('Clear logs'),
        isPinned: true,
        onClick: confirmClearLogs,
        isDanger: true,
      },
    ],
    [confirmClearLogs, t]
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
