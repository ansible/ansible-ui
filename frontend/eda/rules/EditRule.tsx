import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../framework';
import { RouteObj } from '../../Routes';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { API_PREFIX } from '../constants';
import { EdaRule } from '../interfaces/EdaRule';
import { usePatchRequest } from '../../common/crud/usePatchRequest';

export function EditRule() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: rule } = useGet<EdaRule>(`${API_PREFIX}/rules/${id}}/`);

  const { cache } = useSWRConfig();

  const postRequest = usePostRequest<Partial<EdaRule>, EdaRule>();
  const patchRequest = usePatchRequest<Partial<EdaRule>, EdaRule>();

  const onSubmit: PageFormSubmitHandler<EdaRule> = async (rule) => {
    if (Number.isInteger(id)) {
      rule = await patchRequest(`${API_PREFIX}/rules/${id}/`, rule);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } else {
      const newRule = await postRequest(`${API_PREFIX}/rules/`, rule);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(RouteObj.EdaRuleDetails.replace(':id', newRule.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!rule) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Rules'), to: RouteObj.EdaRules }, { label: t('Edit Rule') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Rule')}
            breadcrumbs={[{ label: t('Rules'), to: RouteObj.EdaRules }, { label: t('Edit Rule') }]}
          />
          <PageForm
            submitText={t('Save rule')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={rule}
          >
            <PageFormTextInput<EdaRule> name="name" label={t('Name')} isRequired />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Rule')}
          breadcrumbs={[{ label: t('Rules'), to: RouteObj.EdaRules }, { label: t('Create Rule') }]}
        />
        <PageForm
          submitText={t('Create rule')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormTextInput<EdaRule> name="name" label={t('Name')} isRequired />
        </PageForm>
      </PageLayout>
    );
  }
}
