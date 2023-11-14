import { useTranslation } from 'react-i18next';
import { LoadingPage, PageDetail, PageDetails } from '../../../../../framework';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { Schedule } from '../../../interfaces/Schedule';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { useGetItem } from '../../../../common/crud/useGet';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../api/awx-utils';
import { AwxError } from '../../../common/AwxError';

export function ScheduleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; schedule_id: string }>();
  const {
    data: schedule,
    error,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules/`, params.schedule_id);
  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!schedule) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{schedule?.name}</PageDetail>
      <PageDetail label={t('Description')}>{schedule?.description}</PageDetail>
      <PageDetail label={t('Time zone')}>{schedule?.timezone}</PageDetail>
      <PageDetail label={t('Next run')}>{formatDateString(schedule.next_run)}</PageDetail>
      <UserDateDetail
        label={t('Created')}
        date={schedule.created}
        user={schedule.summary_fields.created_by}
      />
      <UserDateDetail
        label={t('Last modified')}
        date={schedule.modified}
        user={schedule.summary_fields.modified_by}
      />
    </PageDetails>
  );
}
