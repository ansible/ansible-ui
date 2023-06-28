import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageDetail, PageDetails } from '../../../../../framework';
import { UserDateDetail } from '../../../common/UserDateDetail';
import { Schedule } from '../../../interfaces/Schedule';
import { formatDateString } from '../../../../../framework/utils/formatDateString';

export function ScheduleDetails(props: { schedule?: Schedule }) {
  const { t } = useTranslation();
  const { schedule } = props;
  const params = useParams<{ id: string }>();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{schedule?.name}</PageDetail>
      <PageDetail label={t('Description')}>{schedule?.description}</PageDetail>
      <PageDetail label={t('Time zone')}>{schedule?.timezone}</PageDetail>
      <PageDetail label={t('Next run')}>{formatDateString(schedule?.next_run)}</PageDetail>
      <UserDateDetail
        label={t('Created')}
        date={schedule?.created}
        user={schedule?.summary_fields.created_by}
      />
      <UserDateDetail
        label={t('Last modified')}
        date={schedule?.modified}
        user={schedule?.summary_fields.modified_by}
      />
    </PageDetails>
  );
}
