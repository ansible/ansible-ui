import {
  PageFormCheckbox,
  PageFormDataEditor,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormGroup } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormGroup';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Alert } from '@patternfly/react-core';
import jsyaml from 'js-yaml';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { PageFormRuleEngineCredentialSelect } from '../access/credentials/components/PageFormRuleEngineCredentialSelect';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { PageFormEventSourceSelect } from '../common/PageFormEventSourceSelect';
import { edaAPI } from '../common/eda-utils';
import { PageFormDecisionEnvironmentSelect } from '../decision-environments/components/PageFormDecisionEnvironmentSelect';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaEventStream } from '../interfaces/EdaEventStream';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../interfaces/EdaRulebookActivation';
import { EdaSourceEventMapping } from '../interfaces/EdaSource';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { LogLevelEnum, RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectsSelect';
import { RulebookActivationDetails } from './RulebookActivationPage/RulebookActivationDetails';
import { PageFormRulebookSelect } from './components/PageFormRulebooksSelect';

export function CreateRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<IEdaRulebookActivationInputs> = async (
    rulebookActivation
  ) => {
    const eda_credentials: EdaCredential[] = rulebookActivation?.eda_credentials as EdaCredential[];
    const credential_refs: number[] = eda_credentials
      ? eda_credentials.map((credential) => credential?.id)
      : [];
    const newRulebookActivation = await postEdaRulebookActivation(edaAPI`/activations/`, {
      ...rulebookActivation,
      eda_credentials: credential_refs,
    });
    pageNavigate(EdaRoute.RulebookActivationPage, { params: { id: newRulebookActivation.id } });
  };

  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create rulebook activation')}
        breadcrumbs={[
          { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
          { label: t('Create rulebook activation') },
        ]}
      />
      <EdaPageForm<IEdaRulebookActivationInputs>
        submitText={t('Create rulebook activation')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          organization_id: defaultOrganization?.id,
          restart_policy: RestartPolicyEnum.OnFailure,
          log_level: LogLevelEnum.Error,
          is_enabled: true,
          enable_persistence: false,
        }}
      >
        <RulebookActivationInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function RulebookActivationInputs() {
  const { setValue, getFieldState } = useFormContext();
  const { t } = useTranslation();

  const {
    formState: { defaultValues },
  } = useFormContext<IEdaRulebookActivationInputs>();

  const [sourceMappings, setSourceMappings] = useState<EdaSourceEventMapping[] | undefined>(() => {
    return defaultValues?.source_mappings
      ? (jsyaml.load(defaultValues?.source_mappings as string) as EdaSourceEventMapping[])
      : undefined;
  });
  const restartPolicyHelpBlock = (
    <>
      <p>
        {t(
          ' The policy that determines how an activation should restart after the container process running the source plugin ends.'
        )}
      </p>
      <br />
      <p>{t('Policies:')}</p>
      <p>
        {t(
          'Always: This will always restart the rulebook activation regardless of if it ends successfully or not.'
        )}
      </p>
      <p>
        {t('Never: This will never restart a rulebook activation when the container process ends.')}
      </p>
      <p>
        {t(
          'On failure: This will restart the rulebook activation only when the container process fails.'
        )}
      </p>
    </>
  );

  const { data: eventStreams } = useGet<EdaResult<EdaEventStream>>(
    edaAPI`/event-streams/?test_mode=false`
  );

  const { data: config } = useGet<{ deployment_type?: string }>(edaAPI`/config/`);

  const RESTART_OPTIONS = [
    { label: t('On failure'), value: 'on-failure' },
    { label: t('Always'), value: 'always' },
    { label: t('Never'), value: 'never' },
  ];

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

  const LOG_LEVEL_OPTIONS = [
    { label: t('Error'), value: 'error' },
    { label: t('Info'), value: 'info' },
    { label: t('Debug'), value: 'debug' },
  ];

  const projectId = useWatch<IEdaRulebookActivationInputs>({
    name: 'project_id',
  }) as number;

  const rulebook = useWatch<IEdaRulebookActivationInputs>({
    name: 'rulebook_id',
  }) as string;

  const enablePersistence = useWatch<IEdaRulebookActivationInputs>({
    name: 'enable_persistence',
  }) as boolean;

  useEffect(() => {
    setValue('source_mappings', jsyaml.dump(sourceMappings));
  }, [setValue, sourceMappings]);

  useEffect(() => {
    const { isDirty } = getFieldState('rulebook_id');
    if (isDirty) {
      setSourceMappings(undefined);
    }
  }, [getFieldState, rulebook, setSourceMappings]);

  useEffect(() => {
    const { isDirty } = getFieldState('project_id');
    if (isDirty) {
      setValue('rulebook_id', null);
      setSourceMappings(undefined);
    }
  }, [getFieldState, projectId, setValue]);

  useEffect(() => {
    if (!enablePersistence || config?.deployment_type === 'managed') {
      setValue('rule_engine_credential_id', null);
    }
  }, [enablePersistence, config?.deployment_type, setValue]);

  return (
    <>
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="name"
        label={t('Name')}
        id={'name'}
        isRequired={true}
        placeholder={t('Enter rulebook activation name')}
      />
      <PageFormTextArea<IEdaRulebookActivationInputs>
        name="description"
        label={t('Description')}
        id={'description'}
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<IEdaRulebookActivationInputs> name="organization_id" isRequired />
      <PageFormProjectSelect isRequired name={'project_id'} />
      <PageFormRulebookSelect
        isRequired
        name={'rulebook_id'}
        projectId={projectId ? String(projectId) : '0'}
      />
      <PageFormEventSourceSelect
        name={'source_mappings'}
        label={t('Event streams')}
        selectTitle={t('Event streams')}
        placeholder={t('Select event streams')}
        rulebookId={rulebook}
        sourceMappings={sourceMappings || []}
        setSourceMappings={setSourceMappings}
        labelHelp={t(
          'Event streams are server side webhooks that enable you to connect various event sources to your rulebook activations.'
        )}
        labelHelpTitle={t('Event streams')}
        isDisabled={!rulebook || !eventStreams || eventStreams.count < 1}
      />
      <PageFormCredentialSelect<IEdaRulebookActivationInputs>
        name="eda_credentials"
        credentialKinds={['vault,cloud']}
        labelHelp={t(`Select the credentials for this rulebook activation.`)}
      />
      <PageFormDecisionEnvironmentSelect isRequired name={'decision_environment_id'} />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="restart_policy"
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        isRequired
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="log_level"
        label={t('Log level')}
        placeholderText={t('Select log level')}
        isRequired
        options={LOG_LEVEL_OPTIONS}
        labelHelp={logLevelHelpBlock}
        labelHelpTitle={t('Log level')}
      />
      {config?.deployment_type === 'k8s' && (
        <PageFormTextInput<IEdaRulebookActivationInputs>
          name="k8s_service_name"
          label={t('Service name')}
          id={'k8s_service_name'}
          placeholder={t('Enter service name')}
          labelHelp={t('Optional service name.')}
          labelHelpTitle={t('Service name')}
        />
      )}
      <PageFormSwitch<IEdaRulebookActivationInputs>
        id="rulebook-activation"
        name="is_enabled"
        label={t('Rulebook activation enabled?')}
        labelHelp={t('Automatically enable this rulebook activation to run.')}
        labelHelpTitle={t('Rulebook activation enabled')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaRulebookActivationInputs>
          name="extra_var"
          label={t('Variables')}
          format="yaml"
          labelHelp={t(
            `The variables for the rulebook are in a JSON or YAML format. 
            The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
          )}
          labelHelpTitle={t('Variables')}
        />
      </PageFormSection>
      <PageFormSection singleColumn>
        <PageFormGroup label={t('Options')}>
          <PageFormCheckbox<IEdaRulebookActivationInputs>
            label={t`Skip audit events`}
            labelHelpTitle={t`Skip audit events`}
            labelHelp={t(
              'Skipping audit events will prevent you from seeing your events in the Rule Audit, its usually enabled when you are doing performance testing and want to intentionally skip the Audit events from being sent by ansible-rulebook.'
            )}
            name="skip_audit_events"
          />
          <PageFormCheckbox<IEdaRulebookActivationInputs>
            label={t`Auto-restart on project update`}
            labelHelpTitle={t('Auto-restart on project update')}
            labelHelp={t(
              'When enabled, this rulebook activation automatically restarts when its associated project resyncs, so it runs with the latest project content.'
            )}
            name="restart_on_project_update"
          />
          <PageFormCheckbox
            label={t`Enable event persistence`}
            labelHelpTitle={t('Enable event persistence')}
            labelHelp={
              <>
                <p>
                  {t(
                    'Enabling event persistence stores events so they are not lost when a rulebook activation stops or restarts.'
                  )}
                </p>
                <br />
                <p>
                  {t(
                    'If using the platform-provided persistence database, the default System Ansible Rule Engine credential is selected automatically in the credential field below. You can select a different Ansible Rule Engine credential instead if you created one.'
                  )}
                </p>
                <br />
                <p>
                  {t(
                    'If using an external database and no credential exists yet, create an Ansible Rule Engine credential that can reach that database first.'
                  )}
                </p>
              </>
            }
            name="enable_persistence"
          />
        </PageFormGroup>
      </PageFormSection>
      {enablePersistence && config?.deployment_type !== 'managed' && (
        <PageFormSection title={t('Option Details')}>
          <PageFormRuleEngineCredentialSelect<IEdaRulebookActivationInputs> name="rule_engine_credential_id" />
        </PageFormSection>
      )}
    </>
  );
}

export function EditRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/activations/${params.id ?? ''}/`
  );
  const canEditRulebookActivation = data ? Boolean(data.actions?.['PATCH']) : true;

  const { data: rulebookActivation } = useGet<EdaRulebookActivation>(
    edaAPI`/activations/${id.toString()}/`
  );
  const patchEdaRulebookActivation = usePatchRequest<object, EdaRulebookActivation>();

  const onSubmit: PageFormSubmitHandler<IEdaRulebookActivationInputs> = async (
    rulebookActivation
  ) => {
    const eda_credentials: EdaCredential[] = rulebookActivation?.eda_credentials as EdaCredential[];
    const credential_refs: number[] = eda_credentials
      ? eda_credentials.map((credential) => credential?.id)
      : [];
    await patchEdaRulebookActivation(edaAPI`/activations/${id.toString()}/`, {
      ...rulebookActivation,
      eda_credentials: credential_refs,
    });
    void navigate(-1);
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!rulebookActivation) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
            { label: t('Edit Rulebook Activation') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${rulebookActivation?.name || t('Rulebook Activation')}`}
          breadcrumbs={[
            { label: t('Rulebook Activations'), to: getPageUrl(EdaRoute.RulebookActivations) },
            { label: `${t('Edit')} ${rulebookActivation?.name || t('Rulebook Activation')}` },
          ]}
        />
        {!canEditRulebookActivation ? (
          <>
            <Alert
              variant={'warning'}
              isInline
              style={{
                marginLeft: '24px',
                marginRight: '24px',
                marginTop: '24px',
                paddingLeft: '24px',
                paddingTop: '16px',
              }}
              title={t(
                'You do not have permissions to edit this rulebook activation. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <RulebookActivationDetails />
          </>
        ) : (
          <EdaPageForm
            submitText={t('Save rulebook activation')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={{
              ...rulebookActivation,
              organization_id: rulebookActivation.organization?.id,
              project_id: rulebookActivation.project?.id.toString(),
              rulebook_id: rulebookActivation.rulebook?.id,
              decision_environment_id: rulebookActivation.decision_environment?.id,
              is_enabled: false,
              rulebook: rulebookActivation.rulebook as EdaRulebook,
              eda_credentials: rulebookActivation.eda_credentials as [],
              event_streams: rulebookActivation.event_streams as [],
              rule_engine_credential_id: rulebookActivation.rule_engine_credential_id || null,
            }}
          >
            <RulebookActivationInputs />
          </EdaPageForm>
        )}
      </PageLayout>
    );
  }
}

export type IEdaRulebookActivationInputs = Omit<EdaRulebookActivationCreate, 'event_streams'> & {
  rulebook: EdaRulebook;
  event_streams?: string[];
  project_id: string;
  eda_credentials?: number[] | EdaCredential[] | null;
  enable_persistence?: boolean;
  rule_engine_credential_id?: number | null;
  source_mappings: EdaSourceEventMapping[];
  restart_on_project_update: boolean;
};
