import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { useGet } from '../../../../common/crud/useGet';
import { EdaRoute } from '../../../EdaRoutes';
import { edaAPI } from '../../../api/eda-utils';
import { SWR_REFRESH_INTERVAL } from '../../../constants';
import { EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';

export function EventSourceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const { data: eventSource } = useGet<EdaEventSourceRead>(
    edaAPI`/sources/${params.id ?? ''}/`,
    undefined,
    { refreshInterval: SWR_REFRESH_INTERVAL }
  );

  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    edaAPI`/decision-environments/`.concat(`${eventSource?.decision_environment_id || ''}/`)
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{eventSource?.name || ''}</PageDetail>
      <PageDetail label={t('Decision environment')} helpText={t('Decision environment.')}>
        {eventSource && eventSource.decision_environment_id ? (
          <Link
            to={getPageUrl(EdaRoute.DecisionEnvironmentPage, {
              params: { id: eventSource?.decision_environment_id },
            })}
          >
            {decisionEnvironment?.name}
          </Link>
        ) : (
          decisionEnvironment?.name || ''
        )}
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell format="date-time" value={eventSource?.created_at} />
      </PageDetail>
      <LastModifiedPageDetail format="date-time" value={eventSource?.modified_at} />
    </PageDetails>
  );
}
