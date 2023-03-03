import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useSWRConfig } from 'swr';
import { PageForm, PageFormSubmitHandler, PageHeader, PageLayout } from '../../../framework';
import { PageFormSchema } from '../../../framework/PageForm/PageFormSchema';
import { useGet } from '../../common/useItem';
import { requestPatch, requestPost } from '../../Data';
import { RouteObj } from '../../Routes';
import { EdaExecutionEnvironment } from '../interfaces/EdaExecutionEnvironment';
import { API_PREFIX } from '../constants';

export function EditExecutionEnvironment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: executionEnvironment } = useGet<EdaExecutionEnvironment>(
    `${API_PREFIX}/executionEnvironments/${id.toString()}/`
  );

  const ExecutionEnvironmentSchemaType = useMemo(
    () =>
      Type.Object({
        name: Type.String({
          title: t('Name'),
          placeholder: t('Enter the name'), // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        }),
      }),
    [t]
  );

  type ExecutionEnvironmentSchema = Static<typeof ExecutionEnvironmentSchemaType>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<ExecutionEnvironmentSchema> = async (
    executionEnvironment,
    setError
  ) => {
    try {
      if (Number.isInteger(id)) {
        executionEnvironment = await requestPatch<EdaExecutionEnvironment>(
          `${API_PREFIX}/executionEnvironments/${id}/`,
          executionEnvironment
        );
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(-1);
      } else {
        const newExecutionEnvironment = await requestPost<EdaExecutionEnvironment>(
          `${API_PREFIX}/executionEnvironments/`,
          executionEnvironment
        );
        (cache as unknown as { clear: () => void }).clear?.();
        navigate(
          RouteObj.EdaExecutionEnvironmentDetails.replace(
            ':id',
            newExecutionEnvironment.id.toString()
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('Unknown error'));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!executionEnvironment) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('ExecutionEnvironments'), to: RouteObj.EdaExecutionEnvironments },
              { label: t('Edit execution environment') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit execution environment')}
            breadcrumbs={[
              { label: t('ExecutionEnvironments'), to: RouteObj.EdaExecutionEnvironments },
              { label: t('Edit execution environment') },
            ]}
          />
          <PageForm
            schema={ExecutionEnvironmentSchemaType}
            submitText={t('Save execution environment')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={executionEnvironment}
          >
            <PageFormSchema schema={ExecutionEnvironmentSchemaType} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create execution environment')}
          breadcrumbs={[
            { label: t('ExecutionEnvironments'), to: RouteObj.EdaExecutionEnvironments },
            { label: t('Create execution environment') },
          ]}
        />
        <PageForm
          schema={ExecutionEnvironmentSchemaType}
          submitText={t('Create execution environment')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        />
      </PageLayout>
    );
  }
}
