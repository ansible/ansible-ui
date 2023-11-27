import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
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
import { EdaRoute } from '../../EdaRoutes';
import { edaAPI } from '../../api/eda-utils';
import { EdaCredential } from '../../interfaces/EdaCredential';
import {
  EdaDecisionEnvironment,
  EdaDecisionEnvironmentRead,
} from '../../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaPageForm } from '../../EdaPageForm';

function DecisionEnvironmentInputs() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(edaAPI`/credentials/`);
  const imageHelpBlock = (
    <>
      <p>
        {t(
          'The full image location, including the container registry, image name, and version tag.'
        )}
      </p>
      <br />
      <p>{t('Examples:')}</p>
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
        name={'credential_id'}
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
        title={t('Create Decision Environment')}
        breadcrumbs={[
          { label: t('Decision Environments'), to: getPageUrl(EdaRoute.DecisionEnvironments) },
          { label: t('Create Decision Environment') },
        ]}
      />
      <EdaPageForm
        submitText={t('Create decision environment')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
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
        <EdaPageForm
          submitText={t('Save decision environment')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            ...decisionEnvironment,
            credential_id: decisionEnvironment?.credential?.id || undefined,
          }}
        >
          <DecisionEnvironmentInputs />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
