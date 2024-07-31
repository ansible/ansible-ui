import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useAwxView } from '../../common/useAwxView';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { useActivityStreamColumns } from './hooks/useActivityStreamColumns';
import { ActivityStream } from '../../interfaces/ActivityStream';
import { useActivityStreamActions } from './hooks/useActivityStreamActions';
import { useActivityStreamFilter } from './hooks/useActivityStreamFilters';

export function ActivityStreams() {
  const { t } = useTranslation();
  const product: string = process.env.PRODUCT ?? t('AWX');
  const toolbarFilters = useActivityStreamFilter();
  const tableColumns = useActivityStreamColumns();

  const view = useAwxView<ActivityStream>({
    url: awxAPI`/activity_stream/`,
    toolbarFilters,
    tableColumns,
  });
  const rowActions = useActivityStreamActions();
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Activity Stream')}
        titleHelpTitle={t('Activity Stream')}
        titleHelp={t(
          `An activity stream shows all changes for a particular object. For each change, the activity stream shows the time of the event, the user that initiated the event, and the action.`,
          { product }
        )}
        titleDocLink={getDocsBaseUrl(config, 'activityStream')}
        description={t(
          `An activity stream shows all changes for a particular object. For each change, the activity stream shows the time of the event, the user that initiated the event, and the action.`,
          { product }
        )}
      />
      <PageTable
        id="awx-activity-stream"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading activity stream')}
        emptyStateTitle={t('There are currently no activity streams')}
        emptyStateDescription={t(
          'Past and pending activity stream will appear here when available'
        )}
        {...view}
        defaultSubtitle={t('Activity Stream')}
      />
    </PageLayout>
  );
}
