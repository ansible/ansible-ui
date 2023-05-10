import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { PageFormCheckbox, PageHeader, PageLayout } from '../../../../framework';
import { PageFormSlider } from '../../../../framework/PageForm/Inputs/PageFormSlider';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { RouteObj } from '../../../Routes';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { Instance } from '../../interfaces/Instance';
import { getAwxError } from '../../useAwxView';

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

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Instance> = async (editedInstance, setError) => {
    try {
      editedInstance.capacity_adjustment = (Math.round(
        (editedInstance.capacity_adjustment as unknown as number) * 100
      ) / 100) as unknown as string;
      await requestPatch<Instance>(`/api/v2/instances/${id}/`, editedInstance);
      (cache as unknown as { clear: () => void }).clear?.();
      navigate(-1);
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  const onCancel = () => navigate(-1);

  if (!instance) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Instances'), to: RouteObj.Instances },
            { label: t('Edit Instance') },
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
            { label: t('Instances'), to: RouteObj.Instances },
            { label: instance.hostname },
          ]}
        />
        <PageForm<Instance>
          submitText={t('Save instance')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
          defaultValue={{
            capacity_adjustment: Number(instance.capacity_adjustment) as unknown as string,
            enabled: instance.enabled,
          }}
        >
          <PageFormSlider
            name="capacity_adjustment"
            label={t('Capacity')}
            max={99}
            min={instance?.cpu_capacity ?? 1}
            valueLabel={t('forks')}
          />
          <PageFormCheckbox<Instance> name="enabled" label={t('Enabled')} />
        </PageForm>
      </PageLayout>
    );
  }
}
