import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { requestPatch } from '../../common/crud/Data';
import { useGet } from '../../common/crud/useGet';
import { usePostRequest } from '../../common/crud/usePostRequest';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaDecisionEnvironment } from '../interfaces/EdaDecisionEnvironment';

export function EditDecisionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: decisionEnvironment } = useGet<EdaDecisionEnvironment>(
    `${API_PREFIX}/decision-environments/${id.toString()}/`
  );

  const DecisionEnvironmentSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
      }),
    [t]
  );

  type DecisionEnvironmentSchema = Static<typeof DecisionEnvironmentSchemaType>;

  const { cache } = useSWRConfig();

  const postRequest = usePostRequest<Partial<DecisionEnvironmentSchema>, EdaDecisionEnvironment>();

  const onSubmit: PageFormSubmitHandler<DecisionEnvironmentSchema> = async (
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
              { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
              { label: t('Edit execution environment') },
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
              { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
              { label: t('Edit decision environment') },
            ]}
          />
          <PageForm
            schema={DecisionEnvironmentSchemaType}
            submitText={t('Save execution environment')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={decisionEnvironment}
          >
            <PageFormSchema schema={DecisionEnvironmentSchemaType} />
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
            { label: t('Decision Environments'), to: RouteObj.EdaDecisionEnvironments },
            { label: t('Create decision environment') },
          ]}
        />
        <PageForm
          schema={DecisionEnvironmentSchemaType}
          submitText={t('Create decision environment')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        />
      </PageLayout>
    );
  }
}
