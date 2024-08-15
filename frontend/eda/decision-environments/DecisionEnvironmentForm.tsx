import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../framework';
import { useGet } from '../../common/crud/useGet';
import { usePatchRequest } from '../../common/crud/usePatchRequest';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { EdaPageForm } from '../common/EdaPageForm';
import { edaAPI } from '../common/eda-utils';
import { EdaCredential } from '../interfaces/EdaCredential';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../interfaces/EdaResult';
import { EdaRoute } from '../main/EdaRoutes';
import { PageFormSelectOrganization } from '../access/organizations/components/PageFormOrganizationSelect';
import { EdaOrganization } from '../interfaces/EdaOrganization';
import { requestGet, swrOptions } from '../../common/crud/Data';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { DecisionEnvironmentDetails } from './DecisionEnvironmentPage/DecisionEnvironmentDetails';
import { Alert } from '@patternfly/react-core';

function DecisionEnvironmentInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(
    edaAPI`/eda-credentials/` + `?credential_type__kind=registry&page_size=300`
  );
  const imageHelpBlock = (
    <>
      <p>
        {t(
          'The full image location, including the container registry, image name, and version tag.'
        )}
      </p>
      <br />
      <p>{t('Examples: ')}</p>
      <Trans>
        <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
      </Trans>
    </>
  );
  return (
    <>
      <PageFormTextInput<EdaDecisionEnvironment>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<EdaDecisionEnvironment>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
        maxLength={150}
      />
      <PageFormSelectOrganization<EdaDecisionEnvironment> isRequired name="organization_id" />
      <PageFormTextInput<EdaDecisionEnvironment>
        name="image_url"
        label={t('Image')}
        placeholder={t('Enter image name')}
        maxLength={150}
        isRequired
        labelHelpTitle={t('Image')}
        labelHelp={imageHelpBlock}
      />
      <PageFormSelect
        name={'eda_credential_id'}
        label={t('Credential')}
        isRequired={false}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        footer={<Link to={getPageUrl(EdaRoute.CreateCredential)}>Create credential</Link>}
        labelHelp={t('The token needed to utilize the Decision environment image.')}
        labelHelpTitle={t('Credential')}
      />
    </>
  );
}

export function CreateDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const { cache } = useSWRConfig();

  const { data: organizations } = useSWR<EdaResult<EdaOrganization>>(
    edaAPI`/organizations/?name=Default`,
    requestGet,
    swrOptions
  );
  const defaultOrganization =
    organizations && organizations?.results && organizations.results.length > 0
      ? organizations.results[0]
      : undefined;

  const postRequest = usePostRequest<Partial<EdaDecisionEnvironment>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (decisionEnvironment) => {
    const newDecisionEnvironment = await postRequest(
      edaAPI`/decision-environments/`,
      decisionEnvironment
    );
    (cache as unknown as { clear: () => void }).clear?.();
    pageNavigate(EdaRoute.DecisionEnvironmentPage, { params: { id: newDecisionEnvironment.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create decision environment')}
        breadcrumbs={[
          { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          { label: t('Create decision environment') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create decision environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{ organization_id: defaultOrganization?.id }}
      >
        <DecisionEnvironmentInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(
    edaAPI`/decision-environments/${params.id ?? ''}/`
  );
  const canPatchDE = data ? Boolean(data.actions && data.actions['PATCH']) : true;

  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironmentRead>(
    edaAPI`/decision-environments/${id.toString()}/`
  );
  const { cache } = useSWRConfig();
  const patchRequest = usePatchRequest<Partial<EdaDecisionEnvironment>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (decisionEnvironment) => {
    await patchRequest(edaAPI`/decision-environments/${id.toString()}/`, decisionEnvironment);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (!decisionEnvironment) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
            { label: t('Edit Decision Environment') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={`${t('Edit')} ${decisionEnvironment?.name || t('Decision Environment')}`}
          breadcrumbs={[
            { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
            { label: `${t('Edit')} ${decisionEnvironment?.name || t('Decision Environment')}` },
          ]}
        />
        {!canPatchDE ? (
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
                'You do not have permissions to edit this decision environment. Please contact your organization administrator if there is an issue with your access.'
              )}
            />
            <DecisionEnvironmentDetails />
          </>
        ) : (
          <EdaPageForm
            submitText={t('Save decision environment')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={{
              ...decisionEnvironment,
              eda_credential_id: decisionEnvironment?.eda_credential?.id || undefined,
              organization_id: decisionEnvironment?.organization?.id || undefined,
            }}
          >
            <DecisionEnvironmentInputs />
          </EdaPageForm>
        )}
      </PageLayout>
    );
  }
}
