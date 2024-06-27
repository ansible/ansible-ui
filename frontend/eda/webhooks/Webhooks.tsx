import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaWebhook } from '../interfaces/EdaWebhook';
import { EdaRoute } from '../main/EdaRoutes';
import { useWebhookActions } from './hooks/useWebhookActions';
import { useWebhookColumns } from './hooks/useWebhookColumns';
import { useWebhookFilters } from './hooks/useWebhookFilters';
import { useWebhooksActions } from './hooks/useWebhooksActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function Webhooks() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useWebhookFilters();
  const tableColumns = useWebhookColumns();
  const view = useEdaView<EdaWebhook>({
    url: edaAPI`/webhooks/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useWebhooksActions(view);
  const rowActions = useWebhookActions(view);
  return (
    <PageLayout>
      <PageHeader title={t('Event streams')} description={t('Event streams.')} />
      <PageTable
        id="eda-webhooks-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading event streams')}
        emptyStateTitle={t('There are currently no event streams created for your organization.')}
        emptyStateDescription={t('Please create an event stream by using the button below.')}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create event stream')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateWebhook)}
        {...view}
        defaultSubtitle={t('Event stream')}
      />
    </PageLayout>
  );
}
