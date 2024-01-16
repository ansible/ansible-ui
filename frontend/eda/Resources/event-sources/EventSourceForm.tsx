import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageFormDataEditor,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaEventSource, EdaEventSourceRead } from '../../interfaces/EdaEventSource';
import { EdaResult } from '../../interfaces/EdaResult';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { edaAPI } from '../../common/eda-utils';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaPageForm } from '../../common/EdaPageForm';

export interface IEventSourceFields {
  name: string;
  type: string;
  decision_environment: { name: string; id: number };
  args: string;
}
function EventSourceInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: decisionEnvironments } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/decision-environments/`
  );

  return (
    <>
      <PageFormTextInput<EdaEventSource>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<EdaEventSource>
        name="type"
        label={t('Type')}
        placeholder={t('Enter type')}
        isRequired
        maxLength={150}
      />
      <PageFormSelect
        name={'decision_environment_id'}
        label={t('Decision environment')}
        isRequired={false}
        placeholderText={t('Select decision environment')}
        options={
          decisionEnvironments?.results
            ? decisionEnvironments.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={
          <Link to={getPageUrl(EdaRoute.CreateDecisionEnvironment)}>
            Create decision environment
          </Link>
        }
        labelHelp={t('The decision environment for the event source.')}
        labelHelpTitle={t('Decision environment')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IEventSourceFields>
          name="args"
          label={t('Arguments')}
          toggleLanguages={['yaml', 'json']}
          labelHelp={t(`Arguments.`)}
          labelHelpTitle={t('Arguments')}
          allowUpload={false}
          allowDownload={false}
          defaultExpanded={true}
        />
      </PageFormSection>
    </>
  );
}

export function CreateEventSource() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<Partial<EdaEventSource>, EdaEventSource>();

  const onSubmit: PageFormSubmitHandler<EdaEventSource> = async (eventSource) => {
    const newEventSource = await postRequest(edaAPI`/sources/`, eventSource);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.EventSourcePage, { params: { id: newEventSource.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create Event Source')}
        breadcrumbs={[
          { label: t('Event Sources'), to: getPageUrl(EdaRoute.EventSources) },
          { label: t('Create Event Source') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create event source')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ args: '' }}
      >
        <EventSourceInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditEventSource() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const { data: eventSource } = useGet<EdaEventSourceRead>(
    edaAPI`/sources/`.concat(`${params.id}`)
  );
  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<Partial<EdaEventSource>, EdaEventSource>();

  const onSubmit: PageFormSubmitHandler<EdaEventSource> = async (eventSource) => {
    await patchRequest(edaAPI`/sources/`.concat(`${params.id}/`), eventSource);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  if (!eventSource) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Event Sources'), to: getPageUrl(EdaRoute.EventSources) },
            { label: t('Edit Event Source') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${eventSource?.name || t('Event Source')}`}
          breadcrumbs={[
            { label: t('Event Sources'), to: getPageUrl(EdaRoute.EventSources) },
            { label: `${t('Edit')} ${eventSource?.name || t('Event Source')}` },
          ]}
        />
        <EdaPageForm
          submitText={t('Save event source')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            ...eventSource,
            decision_environment_id: eventSource?.decision_environment_id || undefined,
          }}
        >
          <EventSourceInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
