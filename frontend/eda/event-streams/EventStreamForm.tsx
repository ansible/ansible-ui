import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
  PageFormDataEditor,
} from '../../../framework';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaEventStream, EdaEventStreamCreate } from '../interfaces/EdaEventStream';
import { RestartPolicyEnum } from '../interfaces/generated/eda-api';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormCredentialSelect } from '../access/credentials/components/PageFormCredentialsSelect';
import { EdaCredential } from '../interfaces/EdaCredential';
import { PageFormSection } from '../../../framework/PageForm/Utils/PageFormSection';

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
          is_enabled: true,
          args: '',
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

  return (
    <>
      <PageFormTextInput<IEdaEventStreamInputs>
        name="name"
        label={t('Name')}
        id={'name'}
        isRequired={true}
        placeholder={t('Enter name')}
      />
      <PageFormTextInput<IEdaEventStreamInputs>
        name="description"
        label={t('Description')}
        id={'description'}
        placeholder={t('Enter description')}
      />
      <PageFormTextInput<IEdaEventStreamInputs>
        name="source_type"
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
        label={t('Restart policy')}
        placeholderText={t('Select restart policy')}
        options={RESTART_OPTIONS}
        labelHelp={restartPolicyHelpBlock}
        labelHelpTitle={t('Restart policy')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEdaEventStreamInputs>
          name="args"
          label={t('Arguments')}
          isExpandable
          isRequired
          toggleLanguages={['yaml', 'json']}
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
  args: string;
  credentials?: string[];
  credential_refs?: EdaCredential[];
};
