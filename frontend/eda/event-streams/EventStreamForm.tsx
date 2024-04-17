import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaEventStream, EdaEventStreamCreate } from '../interfaces/EdaEventStream';
import { EdaResult } from '../interfaces/EdaResult';
import { LogLevelEnum, RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';

export function CreateEventStream() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postEdaEventStream = usePostRequest<object, EdaEventStream>();

  const onSubmit: PageFormSubmitHandler<IEdaEventStreamInputs> = async (eventStream) => {
    eventStream.credentials = eventStream.credential_refs
      ? eventStream.credential_refs.map((credential) => `${credential.id || ''}`)
      : undefined;
    const newEventStream = await postEdaEventStream(edaAPI`/event-streams/`, eventStream);
    pageNavigate(EdaRoute.EventStreamPage, { params: { id: newEventStream.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Event Stream')}
        breadcrumbs={[
          { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
          { label: t('Create Event Stream') },
        ]}
      />
      <EdaPageForm<IEdaEventStreamInputs>
        submitText={t('Create event stream')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          restart_policy: RestartPolicyEnum.OnFailure,
          log_level: LogLevelEnum.Error,
          is_enabled: true,
          source_args: '',
        }}
      >
        <EventStreamInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EventStreamInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const restartPolicyHelpBlock = (
    <>
      <p>{t('A policy to decide when to restart an event source .')}</p>
      <br />
      <p>{t('Policies:')}</p>
      <p>{t('Always: restarts.')}</p>
      <p>{t('Never: never restarts.')}</p>
      <p>{t('On failure: only restarts when it fails.')}</p>
    </>
  );

  const { data: environments } = useGet<EdaResult<EdaDecisionEnvironment>>(
    edaAPI`/decision-environments/?page=1&page_size=200`
  );

  const RESTART_OPTIONS = [
    { label: t('On failure'), value: 'on-failure' },
    { label: t('Always'), value: 'always' },
    { label: t('Never'), value: 'never' },
  ];

  const LOG_LEVEL_OPTIONS = [
    { label: t('Error'), value: 'error' },
    { label: t('Info'), value: 'info' },
    { label: t('Debug'), value: 'debug' },
  ];

  return (
    <>
      <PageFormTextInput<IEdaEventStreamInputs>
        name="name"
        label={t('Name')}
        id={'name'}
        data-cy="name-form-field"
        isRequired={true}
        placeholder={t('Enter name')}
      />
      <PageFormTextInput<IEdaEventStreamInputs>
        name="description"
        label={t('Description')}
        id={'description'}
        data-cy="description-form-field"
        placeholder={t('Enter description')}
      />
      <PageFormTextInput<IEdaEventStreamInputs>
        name="source_type"
        data-cy="sorce-type-form-field"
        label={t('Source type')}
        id={'source_type'}
        isRequired
        placeholder={t('Enter source type')}
      />
      <PageFormCredentialSelect<{ credential_refs: string; id: string }>
        name="credential_refs"
        labelHelp={t(`Select the credentials for this event stream.`)}
      />
      <PageFormSelect<IEdaEventStreamInputs>
        name="decision_environment_id"
        data-cy="decision-environment-form-field"
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
        footer={
          <Link to={getPageUrl(EdaRoute.CreateDecisionEnvironment)}>
            Create decision environment
          </Link>
        }
        labelHelp={t('Decision environments are a container image to run Ansible rulebooks.')}
        labelHelpTitle={t('Decision environment')}
      />
      <PageFormSelect<IEdaEventStreamInputs>
        name="restart_policy"
        data-cy="restart-policy-form-field"
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSelect<IEdaEventStreamInputs>
        name="log_level"
        label={t('Log level')}
        placeholderText={t('Select log level')}
        isRequired
        options={LOG_LEVEL_OPTIONS}
        labelHelp={t('Error | Info | Debug')}
        labelHelpTitle={t('Log level')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaEventStreamInputs>
          name="source_args"
          data-cy="source-args-form-field"
          label={t('Arguments')}
          format="yaml"
          isRequired
          labelHelp={t(
            `The arguments for the rulebook are in a JSON or YAML format. 
            The content would be equivalent to the file passed through the '--vars' flag of ansible-rulebook command.`
          )}
          labelHelpTitle={t('Arguments')}
        />
      </PageFormSection>
    </>
  );
}

type IEdaEventStreamInputs = Omit<EdaEventStreamCreate, 'event-streams'> & {
  is_enabled?: boolean;
  source_type?: string;
  project_id: string;
  source_args: string;
  credentials?: string[];
  credential_refs?: EdaCredential[];
};
