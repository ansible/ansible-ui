import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useSchedulesActions } from '../hooks/useSchedulesActions';

export function SchedulePage(props: {
  tabs: { label: string; page: string }[];
  backTab: { label: string; page: string; persistentFilterKey: string };
}) {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; source_id?: string; schedule_id: string }>();
  const {
    error,
    data: schedule,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules`, params.schedule_id);
  const navigate = useNavigate();

  const itemActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => navigate(getPageUrl(AwxRoute.Schedules)),
  });

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!schedule) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={schedule?.name}
        breadcrumbs={[
          { label: t('Schedules'), to: getPageUrl(AwxRoute.Templates) },
          { label: schedule?.name },
        ]}
        headerActions={
          <PageActions<Schedule>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={schedule}
          />
        }
      />

      <PageRoutedTabs
        backTab={props.backTab}
        tabs={props.tabs}
        params={{ id: schedule.summary_fields.unified_job_template.id, schedule_id: schedule.id }}
      />
    </PageLayout>
  );
}
