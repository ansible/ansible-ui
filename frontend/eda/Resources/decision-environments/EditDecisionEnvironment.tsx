import { useTranslation } from 'react-i18next';
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
import { requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { RouteObj } from '../../../Routes';
import { API_PREFIX } from '../../constants';
import { EdaDecisionEnvironment } from '../../interfaces/EdaDecisionEnvironment';
import { EdaCredential } from '../../interfaces/EdaCredential';
import { EdaResult } from '../../interfaces/EdaResult';

function DecisionEnvironmentInputs() {
  const { t } = useTranslation();
  const { data: credentials } = useGet<EdaResult<EdaCredential>>(`${API_PREFIX}/credentials/`);
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
        label={t('Registry URL')}
        isRequired={true}
        placeholder={t('Enter registry URL')}
        maxLength={150}
      />
      <PageFormTextInput<EdaDecisionEnvironment>
        name="tag"
        label={t('Tag')}
        placeholder={t('Enter tag')}
      />
      <PageFormSelectOption
        name={'credential'}
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

  const onSubmit: PageFormSubmitHandler<EdaDecisionEnvironment> = async (
    decisionEnvironment,
    setError
  ) => {
    try {
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
          RouteObj.EdaDecisionEnvironmentDetails.replace(
            ':id',
            newDecisionEnvironment.id.toString()
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unknown error'));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!decisionEnvironment) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Decision environments'), to: RouteObj.EdaDecisionEnvironments },
              { label: t('Edit decision environment') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit decision environment')}
            breadcrumbs={[
              { label: t('Decision environments'), to: RouteObj.EdaDecisionEnvironments },
              { label: t('Edit decision environment') },
            ]}
          />
          <PageForm
            submitText={t('Save decision environment')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={decisionEnvironment}
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
          title={t('Create decision environment')}
          breadcrumbs={[
            { label: t('DecisionEnvironments'), to: RouteObj.EdaDecisionEnvironments },
            { label: t('Create decision environment') },
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
