import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
  PageFormCheckbox,
} from '../../../framework';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import {
  EdaRulebookActivation,
  EdaRulebookActivationCreate,
} from '../interfaces/EdaRulebookActivation';
import { LogLevelEnum, RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import useSWR from 'swr';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaSourceEventMapping } from '../interfaces/EdaSource';
import { PageFormGroup } from '../../../framework/PageForm/Inputs/PageFormGroup';
import jsyaml from 'js-yaml';
import { PageFormEventSourceSelect } from '../common/PageFormEventSourceSelect';
import { EdaEventStream } from '../interfaces/EdaEventStream';
import { PageFormRulebookSelect } from './components/PageFormRulebooksSelect';
import { PageFormProjectSelect } from '../projects/components/PageFormProjectsSelect';

export function CreateRulebookActivation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const postEdaRulebookActivation = usePostRequest<object, EdaRulebookActivation>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
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

  const onCancel = () => navigate(-1);
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
        }}
      >
        <RulebookActivationInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function RulebookActivationInputs() {
  const { t } = useTranslation();
  const [sourceMappings, setSourceMappings] = useState<EdaSourceEventMapping[] | undefined>(
    undefined
  );
  const { setValue } = useFormContext();
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
  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?page=1&page_size=200`
  );

  const { data: eventStreams } = useGet<EdaResult<EdaEventStream>>(
    edaAPI`/event-streams/?test_mode=false`
  );

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

  useEffect(() => {
    setValue('source_mappings', jsyaml.dump(sourceMappings));
  }, [setValue, sourceMappings]);

  useEffect(() => {
    setSourceMappings(undefined);
  }, [rulebook, setSourceMappings]);

  return (
    <>
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="name"
        label={t('Name')}
        id={'name'}
        isRequired={true}
        placeholder={t('Enter rulebook activation name')}
      />
      <PageFormTextInput<IEdaRulebookActivationInputs>
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
      <PageFormSelect<IEdaRulebookActivationInputs>
        name="decision_environment_id"
        label={t('Decision environment')}
        placeholderText={t('Select decision environment')}
        options={
          environments?.results
            ? environments.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        isRequired
        labelHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
        labelHelpTitle={t('Decision environment')}
      />
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
      <PageFormTextInput<IEdaRulebookActivationInputs>
        name="k8s_service_name"
        label={t('Service name')}
        id={'k8s_service_name'}
        placeholder={t('Enter service name')}
        labelHelp={t('Optional service name.')}
        labelHelpTitle={t('Service name')}
      />
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
            labelHelp={t(
              'Skipping audit events will prevent you from seeing your events in the Rule Audit, its usually enabled when you are doing performance testing and want to intentionally skip the Audit events from being sent by ansible-rulebook.'
            )}
            name="skip_audit_events"
          />
        </PageFormGroup>
      </PageFormSection>
    </>
  );
}

type IEdaRulebookActivationInputs = Omit<EdaRulebookActivationCreate, 'event_streams'> & {
  rulebook: EdaRulebook;
  event_streams?: string[];
  project_id: string;
  eda_credentials?: number[] | EdaCredential[] | null;
  source_mappings: EdaSourceEventMapping[];
};
