import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageLayout, PageTable } from '../../../../framework';
import { API_PREFIX } from '../../constants';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { useEdaView } from '../../useEventDrivenView';
import { useActivationHistoryColumns } from '../hooks/useActivationHistoryColumns';
import { useActivationHistoryFilters } from '../hooks/useActivationHistoryFilters';

export function RulebookActivationHistory() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const toolbarFilters = useActivationHistoryFilters();

  const tableColumns = useActivationHistoryColumns();
  const view = useEdaView<EdaActivationInstance>({
    url: `${API_PREFIX}/activations/${params?.id || ''}/instances/`,
    toolbarFilters,
    tableColumns,
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
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
