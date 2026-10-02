import {
  PageFormSubmitHandler,
  PageFormSwitch,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { Alert } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredentialType } from '../interfaces/EdaCredentialType';
import { EdaEventStream, EdaEventStreamCreate } from '../interfaces/EdaEventStream';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { EdaResult } from '../interfaces/EdaResult';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { EdaRoute } from '../main/EdaRoutes';
import { EventStreamDetails } from './EventStreamPage/EventStreamDetails';
import { PageFormSelectEventStreamCredential } from './components/PageFormEventStreamCredentialSelect';
import { PageFormSelectEventStreamType } from './components/PageFormEventStreamTypeSelect';

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
        data-testid="name-form-field"
        label={t('Name')}
        placeholder={t('Enter event stream name')}
        isRequired
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaEventStreamCreate> name="organization_id" isRequired />
      <PageFormSelectEventStreamType<IEdaEventStreamCreate> name="type_id" isRequired />
      <PageFormHidden watch={'type'} hidden={() => true}>
        <PageFormTextInput<IEdaEventStreamCreate>
          name="kind"
          data-cy="name-form-field"
          data-testid="name-form-field"
          label={t('Kind')}
        />
      </PageFormHidden>
      <PageFormHidden watch={'type_id'} hidden={() => true}>
        <PageFormTextInput<IEdaEventStreamCreate>
          name="event_stream_type"
          data-cy="type-form-field"
          data-testid="type-form-field"
          isRequired
          label={t('Event stream type')}
        />
      </PageFormHidden>
      {eventStreamType && (
        <PageFormSelectEventStreamCredential<IEdaEventStreamCreate>
          isRequired
          name="eda_credential_id"
          type={eventStreamType?.kind || ''}
        />
      )}
      <PageFormTextInput<IEdaEventStreamCreate>
        name="additional_data_headers"
        data-cy="additional_data_headers-form-field"
        data-testid="additional_data_headers-form-field"
        label={t('Headers')}
        placeholder={t('Enter headers')}
        labelHelpTitle={t('Headers')}
        labelHelp={t(
          'Enter HTTP header keys, separated by commas, that you want to include in the event payload. ' +
            'To include all headers, set the value as *. ' +
            'If the Headers is empty no HTTP headers would be added to the Event Payload or displayed in Test mode.'
        )}
      />
      <PageFormSwitch<IEdaEventStreamCreate>
        label={t`Forward events to rulebook activation`}
        labelOn={t('Enabled')}
        labelHelpTitle={t('Forward events to rulebook activation')}
        labelHelp={t(
          'An event stream is an HTTP POST request comprised of a header and body. The HTTP header typically stores the properties of the body. ' +
            "The event stream's event forwarding can be disabled for testing purposes while diagnosing connections and evaluating the incoming data."
        )}
        name="enabled"
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
        data-testid="name-form-field"
        label={t('Name')}
        placeholder={t('Enter event stream name')}
        isRequired
        maxLength={150}
      />
      <PageFormSelectOrganization<IEdaEventStreamCreate> name="organization_id" isRequired />
      <PageFormTextInput<IEdaEventStreamCreate>
        name="event_stream_type"
        data-cy="type-form-field"
        data-testid="type-form-field"
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
        data-testid="additional_data_headers-form-field"
        label={t('Headers')}
        placeholder={t('Enter headers')}
        labelHelpTitle={t('Headers')}
        labelHelp={t(
          'Enter HTTP header keys, separated by commas, that you want to include in the event payload. ' +
            'To include all headers, set the value as *. ' +
            'If the Headers is empty no HTTP headers would be added to the Event Payload or displayed in Test mode.'
        )}
      />
      <PageFormSwitch<IEdaEventStreamCreate>
        label={t`Forward events to rulebook activation`}
        labelOn={t('Enabled')}
        labelHelpTitle={t('Forward events to rulebook activation')}
        labelHelp={t(
          'An event stream is an HTTP POST request comprised of a header and body. The HTTP header typically stores the properties of the body. ' +
            "The event stream's event forwarding can be disabled for testing purposes while diagnosing connections and evaluating the incoming data."
        )}
        name="enabled"
      />
    </>
  );
}

export function CreateEventStream() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  const postRequest = usePostRequest<EdaEventStreamCreate, EdaEventStream>();
  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const onSubmit: PageFormSubmitHandler<IEdaEventStreamCreate> = async (eventStream) => {
    const newEventStream = await postRequest(edaAPI`/event-streams/`, {
      ...eventStream,
      test_mode: !eventStream?.enabled,
    });
    pageNavigate(EdaRoute.EventStreamPage, { params: { id: newEventStream?.id } });
  };
  const onCancel = () => void navigate(-1);
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
        defaultValue={{ organization_id: defaultOrganization?.id, test_mode: false, enabled: true }}
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
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/event-streams/${params.id ?? ''}/`
  );
  const canEditEventStream = data ? Boolean(data.actions && data.actions['PATCH']) : true;
  const { data: eventStream } = useGet<EdaEventStream>(edaAPI`/event-streams/${id.toString()}/`);

  const patchRequest = usePatchRequest<IEdaEventStreamCreate, EdaEventStream>();

  const onSubmit: PageFormSubmitHandler<IEdaEventStreamCreate> = async (eventStream) => {
    await patchRequest(edaAPI`/event-streams/${id.toString()}/`, {
      ...eventStream,
      test_mode: !eventStream?.enabled,
    });
    void navigate(-1);
  };
  const onCancel = () => void navigate(-1);
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
        {!canEditEventStream ? (
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
                'You do not have permissions to edit this credential. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <EventStreamDetails />
          </>
        ) : (
          <EdaPageForm
            submitText={t('Save event stream')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={{
              ...eventStream,
              enabled: !eventStream.test_mode,
              organization_id: eventStream.organization?.id,
              eda_credential_id: eventStream?.eda_credential?.id,
            }}
          >
            <EventStreamEditInputs />
          </EdaPageForm>
        )}
      </PageLayout>
    );
  }
}

type IEdaEventStreamCreate = EdaEventStreamCreate & {
  type_id: number;
  kind: string;
  enabled: boolean;
};
