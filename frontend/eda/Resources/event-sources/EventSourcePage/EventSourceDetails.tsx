import { PageSection } from '@patternfly/react-core';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails, useGetPageUrl } from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { useGet } from '../../../../common/crud/useGet';
import { edaAPI } from '../../../common/eda-utils';
import { EdaDecisionEnvironment } from '../../../interfaces/EdaDecisionEnvironment';
import { EdaEventSourceRead } from '../../../interfaces/EdaEventSource';
import { EdaRoute } from '../../../main/EdaRoutes';

export function EventSourceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();

  const { data: eventSource } = useGet<EdaEventSourceRead>(edaAPI`/sources/${params.id ?? ''}/`);

  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    edaAPI`/decision-environments/`.concat(`${eventSource?.decision_environment_id || ''}/`)
  );

  const getPageUrl = useGetPageUrl();

  return (
    <Fragment>
      <PageDetails>
        <PageDetail label={t('Name')}>{eventSource?.name || ''}</PageDetail>
        <PageDetail label={t('Type')}>{eventSource?.type || ''}</PageDetail>
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
      {eventSource?.args && (
        <PageSection variant="light">
          <PageDetailCodeEditor
            value={eventSource.args}
            showCopyToClipboard={true}
            label={t('Args')}
            helpText={t(`The arguments are in a JSON or YAML format.`)}
          />
        </PageSection>
      )}
    </Fragment>
  );
}
