import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageDetail,
  PageDetails,
  Scrollable,
  useGetPageUrl,
} from '../../../../framework';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStream } from '../../interfaces/EdaEventStream';
import { RestartPolicyEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { logLevelName } from '../../rulebook-activations/RulebookActivationPage/RulebookActivationDetails';

export function EventStreamDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: eventStream } = useGetItem<EdaEventStream>(edaAPI`/event-streams/`, params.id);
  const getPageUrl = useGetPageUrl();
  const restartPolicyHelpBlock = (
    <>
      <p>{t('A policy to decide when to restart a rulebook.')}</p>
      <br />
      <p>{t('Policies:')}</p>
      <p>{t('Always: restarts when a rulebook finishes.')}</p>
      <p>{t('Never: never restarts a rulebook when it finishes.')}</p>
      <p>{t('On failure: only restarts when it fails.')}</p>
    </>
  );
  if (!eventStream) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      <PageDetails disableScroll={true}>
        <PageDetail label={t('Event stream ID')}>{eventStream?.id || ''}</PageDetail>
        <PageDetail label={t('Name')}>{eventStream?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{eventStream?.description || ''}</PageDetail>
        <PageDetail label={t('Source type')}>{eventStream?.source_type || ''}</PageDetail>
        {eventStream.credentials && eventStream.credentials.length > 0 && (
          <PageDetail label={t('Credential(s)')}>
            <LabelGroup>
              {eventStream.credentials.map((credential) => (
                <Label key={credential?.id}>{credential?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        )}
        <PageDetail
          label={t('Decision environment')}
          helpText={t('Decision environments are a container image to run Ansible rulebooks.')}
        >
          {eventStream && eventStream?.decision_environment?.id ? (
            <Link
              to={getPageUrl(EdaRoute.DecisionEnvironmentPage, {
                params: { id: eventStream?.decision_environment?.id },
              })}
            >
              {eventStream?.decision_environment?.name}
            </Link>
          ) : (
            eventStream?.decision_environment?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Event stream status')}>
          <StatusCell status={eventStream?.status || ''} />
        </PageDetail>
        <PageDetail label={t('Restart policy')} helpText={restartPolicyHelpBlock}>
          {eventStream?.restart_policy ? restartPolicyName(eventStream?.restart_policy, t) : ''}
        </PageDetail>
        <PageDetail label={t('Log level')} helpText={t('Error | Info | Debug')}>
          {logLevelName(eventStream.log_level, t)}
        </PageDetail>
        <PageDetail label={t('Created')}>
          {eventStream?.created_at ? formatDateString(eventStream?.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail value={eventStream?.modified_at ? eventStream?.modified_at : ''} />
      </PageDetails>
      {eventStream?.source_args && (
        <PageDetails disableScroll={true} numberOfColumns={'single'}>
          <PageDetailCodeEditor
            value={eventStream.source_args}
            showCopyToClipboard={true}
            label={t('Arguments')}
            helpText={t('Arguments')}
          />
        </PageDetails>
      )}
    </Scrollable>
  );
}

function restartPolicyName(policy: RestartPolicyEnum, t: (str: string) => string) {
  switch (policy) {
    case RestartPolicyEnum.OnFailure:
      return t('On failure');
    case RestartPolicyEnum.Always:
      return t('Always');
    case RestartPolicyEnum.Never:
      return t('Never');
    default:
      return capitalizeFirstLetter(policy);
  }
}
