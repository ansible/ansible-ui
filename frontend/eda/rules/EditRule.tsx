import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { useGet } from '../../common/useItem';
import { requestPatch, requestPost } from '../../Data';
import { RouteE } from '../../Routes';
import { EdaRule } from '../interfaces/EdaRule';
import { API_PREFIX } from '../constants';

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

  const onSubmit: PageFormSubmitHandler<RuleSchema> = async (rule, setError) => {
    try {
      if (Number.isInteger(id)) {
        rule = await requestPatch<EdaRule>(`${API_PREFIX}/rules/${id}/`, rule);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newRule = await requestPost<EdaRule>(`${API_PREFIX}/rules/`, rule);
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(RouteE.EdaRuleDetails.replace(':id', newRule.id.toString()));
      }
    } catch (err) {
      setError('TODO');
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!rule) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Rules'), to: RouteE.EdaRules }, { label: t('Edit rule') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit rule')}
            breadcrumbs={[{ label: t('Rules'), to: RouteE.EdaRules }, { label: t('Edit rule') }]}
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
          title={t('Create rule')}
          breadcrumbs={[{ label: t('Rules'), to: RouteE.EdaRules }, { label: t('Create rule') }]}
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
