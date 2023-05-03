import { Trans, useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSelectOption,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { API_PREFIX } from '../../constants';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaResult } from '../../interfaces/EdaResult';

function DecisionEnvironmentInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
  const imageHelpBlock = (
    <Trans i18nKey="imageHelpBlock">
      <p>The full image location, including the container registry, image name, and version tag.</p>
      <br />
      <p>Examples:</p>
      <code>quay.io/ansible/awx-latest repo/project/image-name:tag</code>
    </Trans>
  );
  return (
    <>
      <PageFormTextInput<EdaDecisionEnvironment>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
        autoComplete="new-name"
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
        labelHelp={imageHelpBlock}
      />
      <PageFormSelectOption
        name={'credential_id'}
        label={t('Credential')}
        placeholderText={t('Select credential')}
        options={
          credentials?.results
            ? credentials.results.map((item: { name: string; id: number }) => ({
                label: item.name,
                value: item.id,
              }))
            : []
        }
        labelHelp={t(
          'Credentials are used for authentication when launching Jobs against machines, synchronizing with inventory sources, and importing project content from a version control system.'
        )}
      />
    </>
  );
}

export function EditDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    `${API_PREFIX}/decision-environments/${id.toString()}/`
  );
  const { cache } = useSWRConfig();
  const postRequest = usePostRequest<Partial<EdaDecisionEnvironment>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (decisionEnvironment) => {
    if (Number.isInteger(id)) {
      await requestPatch<EdaDecisionEnvironment>(
        `${API_PREFIX}/decision-environments/${id}/`,
        decisionEnvironment
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } else {
      const newDecisionEnvironment = await postRequest(
        `${API_PREFIX}/decision-environments/`,
        decisionEnvironment
      );
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(
        RouteObj.EdaDecisionEnvironmentDetails.replace(':id', newDecisionEnvironment.id.toString())
      );
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!decisionEnvironment) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
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
              { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
              { label: `${t('Edit')} ${decisionEnvironment?.name || t('Decision Environment')}` },
            ]}
          />
          <PageForm
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
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Decision Environment')}
          breadcrumbs={[
            { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
            { label: t('Create Decision Environment') },
          ]}
        />
        <PageForm
          submitText={t('Create decision environment')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <DecisionEnvironmentInputs />
        </PageForm>
      </PageLayout>
    );
  }
}
