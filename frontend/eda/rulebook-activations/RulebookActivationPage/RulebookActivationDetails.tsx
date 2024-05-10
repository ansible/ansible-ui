import { Label, LabelGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  CopyCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  Scrollable,
  useGetPageUrl,
} from '../../../../framework';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { capitalizeFirstLetter } from '../../../../framework/utils/strings';
import { LastModifiedPageDetail } from '../../../common/LastModifiedPageDetail';
import { StatusCell } from '../../../common/Status';
import { useGetItem } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { LogLevelEnum, RestartPolicyEnum, StatusEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaExtraVarsCell } from '../components/EdaExtraVarCell';
import { SelectVariant } from '@patternfly/react-core/deprecated';

export function RulebookActivationDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: rulebookActivation } = useGetItem<EdaRulebookActivation>(
    edaAPI`/activations/`,
    params.id
  );
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
  if (!rulebookActivation) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
      <PageDetails
        disableScroll={true}
        alertPrompts={
          rulebookActivation.status === StatusEnum.Error ||
          rulebookActivation.status === StatusEnum.Failed
            ? [`${t('Rulebook Activation error: ')}${rulebookActivation?.status_message || ''}`]
            : []
        }
      >
        <PageDetail label={t('Activation ID')}>{rulebookActivation?.id || ''}</PageDetail>
        <PageDetail label={t('Name')}>{rulebookActivation?.name || ''}</PageDetail>
        <PageDetail label={t('Description')}>{rulebookActivation?.description || ''}</PageDetail>
        <PageDetail label={t('Organization')}>
          {rulebookActivation && rulebookActivation.organization ? (
            <Link
              to={getPageUrl(EdaRoute.OrganizationPage, {
                params: { id: rulebookActivation?.organization?.id },
              })}
            >
              {rulebookActivation?.organization?.name}
            </Link>
          ) : (
            rulebookActivation?.organization?.name || ''
          )}
        </PageDetail>
        <PageDetail
          label={t('Project')}
          helpText={t('Projects are a logical collection of rulebooks.')}
        >
          {rulebookActivation && rulebookActivation.project?.id ? (
            <Link
              to={getPageUrl(EdaRoute.ProjectPage, {
                params: { id: rulebookActivation.project.id },
              })}
            >
              {rulebookActivation?.project?.name}
            </Link>
          ) : (
            rulebookActivation?.project?.name || ''
          )}
        </PageDetail>
        <PageDetail
          label={t('Rulebook')}
          helpText={t('Rulebooks will be shown according to the project selected.')}
        >
          {rulebookActivation?.rulebook?.name || rulebookActivation?.rulebook_name || ''}
        </PageDetail>
        {rulebookActivation.event_streams && rulebookActivation.event_streams.length > 0 && (
          <PageDetail label={t('Event stream(s)')}>
            <LabelGroup>
              {rulebookActivation.event_streams.map((stream) => (
                <Label key={stream?.id}>{stream?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        )}
        {rulebookActivation.eda_credentials && rulebookActivation.eda_credentials.length > 0 && (
          <PageDetail
            label={t('Credential(s)')}
            helpText={t(`Credentials for this rulebook activation.`)}
          >
            <LabelGroup>
              {rulebookActivation.eda_credentials.map((credential) => (
                <Label key={credential?.id}>{credential?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        )}
        <PageDetail
          label={t('Decision environment')}
          helpText={t('Decision environments are a container image to run Ansible rulebooks.')}
        >
          {rulebookActivation && rulebookActivation?.decision_environment?.id ? (
            <Link
              to={getPageUrl(EdaRoute.DecisionEnvironmentPage, {
                params: { id: rulebookActivation?.decision_environment?.id },
              })}
            >
              {rulebookActivation?.decision_environment?.name}
            </Link>
          ) : (
            rulebookActivation?.decision_environment?.name || ''
          )}
        </PageDetail>
        <PageDetail label={t('Restart policy')} helpText={restartPolicyHelpBlock}>
          {rulebookActivation?.restart_policy
            ? restartPolicyName(rulebookActivation?.restart_policy, t)
            : ''}
        </PageDetail>
        <PageDetail label={t('Activation status')}>
          <StatusCell status={rulebookActivation?.status || ''} />
        </PageDetail>
        {rulebookActivation.status !== StatusEnum.Error &&
          rulebookActivation.status !== StatusEnum.Failed &&
          !!rulebookActivation?.status_message && (
            <PageDetail label={t('Status message')}>
              {rulebookActivation?.status_message}
            </PageDetail>
          )}
        <PageDetail
          label={t('Log level')}
          helpText={t('The different log level options: Error, Info, and Debug.')}
        >
          {logLevelName(rulebookActivation?.log_level || LogLevelEnum.Error, t)}
        </PageDetail>
        <PageDetail label={t('Service name')} helpText={t('Optional service name.')}>
          {rulebookActivation?.k8s_service_name}
        </PageDetail>
        <PageDetail label={t('Project git hash')}>
          <CopyCell text={rulebookActivation?.git_hash ?? ''} />
        </PageDetail>
        <PageDetail label={t('Number of rules')}>{rulebookActivation?.rules_count || 0}</PageDetail>
        <PageDetail label={t('Fire count')}>
          {rulebookActivation?.rules_fired_count || 0}
        </PageDetail>
        <PageDetail label={t('Last restarted')}>
          {rulebookActivation?.restarted_at
            ? formatDateString(rulebookActivation.restarted_at)
            : ''}
        </PageDetail>
        <PageDetail label={t('Restart count')}>{rulebookActivation?.restart_count || 0}</PageDetail>
        <PageDetail label={t('Created')}>
          {rulebookActivation?.created_at ? formatDateString(rulebookActivation?.created_at) : ''}
        </PageDetail>
        <LastModifiedPageDetail
          value={rulebookActivation?.modified_at ? rulebookActivation?.modified_at : ''}
        />
      </PageDetails>
      {rulebookActivation?.extra_var && (
        <PageDetails disableScroll={true} numberOfColumns={SelectVariant.single}>
          <EdaExtraVarsCell
            label={t('Variables')}
            helpText={t(
              `The variables for the rulebook are in a JSON or YAML format. The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
            )}
            text={rulebookActivation.extra_var}
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
export function logLevelName(logLevel: LogLevelEnum, t: (str: string) => string) {
  switch (logLevel) {
    case LogLevelEnum.Error:
      return t('Error');
    case LogLevelEnum.Info:
      return t('Info');
    case LogLevelEnum.Debug:
      return t('Debug');
    default:
      return capitalizeFirstLetter(logLevel);
  }
}
