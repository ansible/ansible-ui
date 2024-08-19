import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import {
  PageFormCheckbox,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useGet, useGetItem } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaEventStream, EdaEventStreamCreate } from '../interfaces/EdaEventStream';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormSelectEventStreamType } from './components/PageFormEventStreamTypeSelect';
import { PageFormSelectEventStreamCredential } from './components/PageFormEventStreamCredentialSelect';
import { useFormContext, useWatch } from 'react-hook-form';
import { EdaCredentialType } from '../interfaces/EdaCredentialType';
import { useEffect } from 'react';
import { PageFormHidden } from '../../../framework/PageForm/Utils/PageFormHidden';

// eslint-disable-next-line react/prop-types
function EventStreamInputs() {
  const { t } = useTranslation();
  const typeId = useWatch<IEdaEventStreamCreate>({
    name: 'type_id',
  }) as number;
  const { setValue } = useFormContext();
  const useEventStreamTypeKind = (type_id: number) => {
    const { data } = useGetItem<EdaCredentialType>(edaAPI`/credential-types/`, type_id);
    return data;
  };

  const eventStreamType = useEventStreamTypeKind(typeId);

  useEffect(() => {
    const resetCredential = () => {
      setValue('eda_credential_id', undefined);
      setValue('event_stream_type', eventStreamType?.kind);
    };
    resetCredential();
  }, [typeId, setValue, eventStreamType?.kind]);

  return (
    <>
      <PageFormTextInput<IEdaEventStreamCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        labelHelpTitle={t('Name')}
        labelHelp={t(
          'The name should match the source name defined in the rulebook. If the source name matches we will swap the event source in the rulebook with this event source.'
        )}
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaEventStreamCreate> name="organization_id" isRequired />
      <PageFormSelectEventStreamType<IEdaEventStreamCreate> name="type_id" isRequired />
      <PageFormHidden watch={'type'} hidden={() => true}>
        <PageFormTextInput<IEdaEventStreamCreate>
          name="kind"
          data-cy="name-form-field"
          label={t('Kind')}
        />
      </PageFormHidden>
      <PageFormHidden watch={'type_id'} hidden={() => true}>
        <PageFormTextInput<IEdaEventStreamCreate>
          name="event_stream_type"
          data-cy="type-form-field"
          isRequired
          label={t('Event stream type')}
        />
      </PageFormHidden>
      <PageFormSelectEventStreamCredential<IEdaEventStreamCreate>
        isRequired
        name="eda_credential_id"
        type={eventStreamType?.kind || ''}
      />
      <PageFormTextInput<IEdaEventStreamCreate>
        name="additional_data_headers"
        data-cy="additional_data_headers-form-field"
        label={t('Include headers')}
        placeholder={t('Enter include headers')}
        labelHelpTitle={t('Include headers')}
        labelHelp={t(
          'A comma separated HTTP header keys that you want to include in the event payload.'
        )}
      />
      <PageFormCheckbox<IEdaEventStreamCreate>
        label={t`Test mode`}
        labelHelp={t('Test mode.')}
        name="test_mode"
      />
    </>
  );
}

function EventStreamEditInputs() {
  const { t } = useTranslation();
  const eventStreamType = useWatch<IEdaEventStreamCreate>({
    name: 'event_stream_type',
  }) as string;
  return (
    <>
      <PageFormTextInput<IEdaEventStreamCreate>
        name="name"
        data-cy="name-form-field"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaEventStreamCreate> name="organization_id" isRequired />
      <PageFormTextInput<IEdaEventStreamCreate>
        name="event_stream_type"
        data-cy="type-form-field"
        isReadOnly
        label={t('Event stream type')}
      />
      <PageFormSelectEventStreamCredential<IEdaEventStreamCreate>
        name="eda_credential_id"
        isRequired
        type={eventStreamType}
      />
      <PageFormTextInput<IEdaEventStreamCreate>
        name="additional_data_headers"
        data-cy="additional_data_headers-form-field"
        label={t('Include headers')}
        placeholder={t('Enter include headers')}
        labelHelpTitle={t('Include headers')}
        labelHelp={t(
          'A comma separated HTTP header keys that you want to include in the event payload.'
        )}
      />
      <PageFormCheckbox<IEdaEventStreamCreate>
        label={t`Test mode`}
        labelHelp={t('Test mode.')}
        name="test_mode"
      />
    </>
  );
}

export function CreateEventStream() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<EdaEventStreamCreate, EdaEventStream>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<EdaEventStreamCreate> = async (eventStream) => {
    const newEventStream = await postRequest(edaAPI`/event-streams/`, eventStream);
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.EventStreamPage, { params: { id: newEventStream?.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create event stream')}
        breadcrumbs={[
          { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
          { label: t('Create event stream') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create event stream')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ organization_id: defaultOrganization?.id }}
      >
        <EventStreamInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditEventStream() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: eventStream } = useGet<EdaEventStream>(edaAPI`/event-streams/${id.toString()}/`);

  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<IEdaEventStreamCreate, EdaEventStream>();

  const onSubmit: PageFormSubmitHandler<IEdaEventStreamCreate> = async (eventStream) => {
    await patchRequest(edaAPI`/event-streams/${id.toString()}/`, eventStream);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!eventStream) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
            { label: t('Edit event stream') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${eventStream?.name || t('event stream')}`}
          breadcrumbs={[
            { label: t('Event Streams'), to: getPageUrl(EdaRoute.EventStreams) },
            { label: `${t('Edit')} ${eventStream?.name || t('event stream')}` },
          ]}
        />
        <EdaPageForm
          submitText={t('Save event stream')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            ...eventStream,
            organization_id: eventStream.organization?.id,
            eda_credential_id: eventStream?.eda_credential?.id,
          }}
        >
          <EventStreamEditInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}

type IEdaEventStreamCreate = EdaEventStreamCreate & {
  type_id: number;
  kind: string;
};
