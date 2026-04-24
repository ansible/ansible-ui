import {
  CopyCell,
  DateTimeCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  Scrollable,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { StandardPopover } from '@ansible/ansible-ui-framework/components/StandardPopover';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { capitalizeFirstLetter } from '@ansible/ansible-ui-framework/utils/strings';
import { LastModifiedPageDetail } from '@ansible/common-ui/LastModifiedPageDetail';
import { StatusCell } from '@ansible/common-ui/Status';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import {
  Alert,
  Content,
  ContentVariants,
  Divider,
  Label,
  LabelGroup,
  Split,
  SplitItem,
  Tooltip,
} from '@patternfly/react-core';
import jsyaml from 'js-yaml';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaSourceEventMapping } from '../../interfaces/EdaSource';
import { LogLevelEnum, RestartPolicyEnum } from '../../interfaces/generated/eda-api';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaExtraVarsCell } from '../components/EdaExtraVarCell';

export enum SelectVariant {
  single = 'single',
  checkbox = 'checkbox',
  typeahead = 'typeahead',
  typeaheadMulti = 'typeaheadmulti',
}

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
  const logLevelHelpBlock = (
    <>
      <p>{t('The different log level options:')}</p>
      <p>{t('Error: Logs that contain a rulebook activation error message.')}</p>
      <p>
        {t(
          'Info: Logs that contain useful information about rulebook activations, such as a success or failure.'
        )}
      </p>
      <p>
        {t(
          'Debug: Logs that contain information that is only useful during the debug phase and might be of little value during production. This log level includes both error and log level data.'
        )}
      </p>
    </>
  );
  if (!rulebookActivation) {
    return <LoadingPage />;
  }
  const sourceMappings: EdaSourceEventMapping[] | undefined = rulebookActivation.source_mappings
    ? (jsyaml.load(rulebookActivation.source_mappings) as EdaSourceEventMapping[])
    : undefined;

  const anyEventsDisabled =
    rulebookActivation.event_streams && rulebookActivation.event_streams.length > 0
      ? rulebookActivation.event_streams.find((ev) => ev.test_mode)
      : false;
  return (
    <Scrollable>
      {anyEventsDisabled && (
        <Alert
          variant={'warning'}
          isInline
          style={{ marginLeft: '24px', marginTop: '16px', marginRight: '16px' }}
          title={t('Event stream disabled.')}
        >
          <p>
            {t(
              "One of the rulebook activation's event streams has been disabled and is not forwarding events to the activation."
            )}
          </p>
        </Alert>
      )}
      <PageDetails disableScroll={true} numberOfColumns={'single'}>
        <Split hasGutter>
          <SplitItem>
            <StatusCell status={rulebookActivation?.status} />
          </SplitItem>
          <SplitItem>{' | '}</SplitItem>
          <SplitItem>{rulebookActivation?.status_message}</SplitItem>
        </Split>
        <Divider />
      </PageDetails>
      <PageDetails disableScroll={true}>
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
          helpText={t('A project is a logical collection of rulebooks.')}
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
        {!!sourceMappings && sourceMappings.length > 0 && (
          <PageDetail label={t('Event stream(s)')}>
            <LabelGroup>
              {sourceMappings.map((mapping) => (
                <Tooltip
                  key={mapping?.event_stream_id}
                  content={`${mapping?.event_stream_name} ${t(' was swapped with ')} ${mapping?.source_name}`}
                >
                  <Label
                    color="blue"
                    data-cy={`mapping-${mapping?.event_stream_id}`}
                    data-testid={`mapping-${mapping?.event_stream_id}`}
                    key={mapping?.event_stream_id}
                    render={({ className }) => (
                      <Link
                        to={getPageUrl(EdaRoute.EventStreamPage, {
                          params: { id: mapping?.event_stream_id },
                        })}
                        className={className}
                      >
                        {mapping?.event_stream_name ?? ''}
                      </Link>
                    )}
                  >
                    {mapping?.event_stream_name ?? ''}
                  </Label>
                </Tooltip>
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
        {rulebookActivation.rule_engine_credential && (
          <PageDetail
            label={t('Event persistence credential')}
            helpText={t('The credential used for event persistence')}
          >
            <Label
              key={rulebookActivation.rule_engine_credential?.id}
              data-testid="rule-engine-credential"
            >
              {rulebookActivation.rule_engine_credential?.name}
            </Label>
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
        <PageDetail label={t('Log level')} helpText={logLevelHelpBlock}>
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
          <DateTimeCell
            value={rulebookActivation.created_at}
            author={rulebookActivation?.created_by?.username}
          />
        </PageDetail>
        <PageDetail label={t('Last edited')}>
          <DateTimeCell
            value={rulebookActivation.edited_at}
            author={rulebookActivation?.edited_by?.username}
          />
        </PageDetail>
        <LastModifiedPageDetail
          value={rulebookActivation?.modified_at ? rulebookActivation?.modified_at : ''}
          author={rulebookActivation?.modified_by?.username}
        />
        {rulebookActivation?.extra_var && (
          <EdaExtraVarsCell
            label={t('Variables')}
            helpText={t(
              `The variables for the rulebook are in a JSON or YAML format. The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
            )}
            text={rulebookActivation.extra_var}
          />
        )}
        {(!!rulebookActivation?.skip_audit_events ||
          !!rulebookActivation.restart_on_project_update ||
          !!rulebookActivation?.enable_persistence) && (
          <PageDetail label={t('Enabled options')} id="enabled-option">
            <Content component={ContentVariants.ul}>
              {!!rulebookActivation?.skip_audit_events && (
                <Content component={ContentVariants.li}>
                  {t('Skip audit events')}
                  <StandardPopover
                    header={t('Skip audit events')}
                    content={t(
                      'Skipping audit events will prevent you from seeing your events in the Rule Audit, ' +
                        'its usually enabled when you are doing performance testing and want to intentionally skip the Audit events from being sent by ansible-rulebook.'
                    )}
                  />
                </Content>
              )}
              {!!rulebookActivation.restart_on_project_update && (
                <Content component={ContentVariants.li}>
                  {t('Auto-restart on project update')}
                  <StandardPopover
                    header={t('Auto-restart on project update')}
                    content={t(
                      'When enabled, this rulebook activation automatically restarts when its associated project resyncs, so it runs with the latest project content.'
                    )}
                  />
                </Content>
              )}
              {!!rulebookActivation?.enable_persistence && (
                <Content component={ContentVariants.li} data-testid="enable-persistence">
                  {t('Enable event persistence')}
                  <StandardPopover
                    header={t('Enable event persistence')}
                    content={t(
                      'When enabled you can select the Event-Driven Ansible Rule Engine credential to allow event persistence so that events are not lost if the rulebook activation is down or restarted. If one is not selected it will default to use the System Event-Driven Ansible Rule Engine Credential.'
                    )}
                  />
                </Content>
              )}
            </Content>
          </PageDetail>
        )}
      </PageDetails>
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
