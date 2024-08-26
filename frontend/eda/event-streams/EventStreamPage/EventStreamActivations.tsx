import { CubesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { useEventStreamActivationsColumns } from '../hooks/useEventStreamActivationsColumns';
import { useEventStreamActivationsFilters } from '../hooks/useEventStreamActivationsFilters';
import { useEdaView } from '../../common/useEventDrivenView';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { PageLayout, PageTable } from '../../../../framework';

export function EventStreamActivations() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();

  const toolbarFilters = useEventStreamActivationsFilters();
  const tableColumns = useEventStreamActivationsColumns();
  const view = useEdaView<EdaRulebookActivation>({
    url: edaAPI`/event-streams/${params?.id || ''}/activations/`,
    toolbarFilters,
    tableColumns,
  });
  return (
    <PageLayout>
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading activations for this event stream')}
        emptyStateTitle={t('No activations for this event stream')}
        emptyStateIcon={CubesIcon}
        emptyStateDescription={t('No activations for this event stream')}
        {...view}
        defaultSubtitle={t('Activations')}
      />
    </PageLayout>
  );
}
