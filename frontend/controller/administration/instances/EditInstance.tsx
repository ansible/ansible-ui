import { Static, Type } from '@sinclair/typebox';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSchema } from '../../../../framework/PageForm/PageFormSchema';
import { requestGet, requestPatch, swrOptions } from '../../../Data';
import { RouteE } from '../../../Routes';
import { Instance } from '../../interfaces/Instance';
import { getControllerError } from '../../useControllerView';

export function EditInstance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: instance } = useSWR<Instance>(
    `/api/v2/instances/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  const EditInstanceSchema = useMemo(
    () =>
      Type.Object({
        capacity_adjustment: Type.Number({
          title: t('Capacity'),
          max: 99,
          min: instance?.cpu_capacity ?? 1,
          valueLabel: 'forks',
        }),
        enabled: Type.Boolean({
          title: t('Enabled'),
        }),
      }),
    [instance?.cpu_capacity, t]
  );

  type CreateInstance = Static<typeof EditInstanceSchema>;

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<CreateInstance> = async (editedInstance, setError) => {
    try {
      editedInstance.capacity_adjustment =
        Math.round(editedInstance.capacity_adjustment * 100) / 100;
      await requestPatch<Instance>(`/api/v2/instances/${id}/`, editedInstance);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } catch (err) {
      setError(await getControllerError(err));
    }
  };
  const onCancel = () => navigate(-1);

  if (!instance) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Instances'), to: RouteE.Instances },
            { label: t('Edit instance') },
          ]}
        />
      </PageLayout>
    );
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={instance.hostname}
          breadcrumbs={[
            { label: t('Instances'), to: RouteE.Instances },
            { label: instance.hostname },
          ]}
        />
        <PageForm
          schema={EditInstanceSchema}
          submitText={t('Save instance')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            capacity_adjustment: Number(instance.capacity_adjustment),
            enabled: instance.enabled,
          }}
        >
          <PageFormSchema schema={EditInstanceSchema} />
        </PageForm>
      </PageLayout>
    );
  }
}
