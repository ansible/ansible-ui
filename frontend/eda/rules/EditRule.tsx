import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { RouteObj } from '../../Routes';
import { requestPatch } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { API_PREFIX } from '../constants';
import { EdaRule } from '../interfaces/EdaRule';

export function EditRule() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: rule } = useGet<EdaRule>(`${API_PREFIX}/rules/${id}}/`);

  const RuleSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
      }),
    [t]
  );

  type RuleSchema = Static<typeof RuleSchemaType>;

  const { cache } = useSWRConfig();

  const postRequest = usePostRequest<Partial<EdaRule>, EdaRule>();

  const onSubmit: PageFormSubmitHandler<RuleSchema> = async (rule) => {
    if (Number.isInteger(id)) {
      rule = await requestPatch<EdaRule>(`${API_PREFIX}/rules/${id}/`, rule);
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
            schema={RuleSchemaType}
            submitText={t('Save rule')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={rule}
          >
            <PageFormSchema schema={RuleSchemaType} />
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
          schema={RuleSchemaType}
          submitText={t('Create rule')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormSchema schema={RuleSchemaType} />
        </PageForm>
      </PageLayout>
    );
  }
}
