import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { PageFormCheckbox, PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageFormSlider } from '../../../../framework/PageForm/Inputs/PageFormSlider';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { requestGet, requestPatch, swrOptions } from '../../../common/crud/Data';
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { Instance } from '../../interfaces/Instance';
import { AwxRoute } from '../../main/AwxRoutes';

export function EditInstance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: instance } = useSWR<Instance>(
    awxAPI`/instances/${id.toString()}/`,
    requestGet,
    swrOptions
  );

  const { cache } = useSWRConfig();

  const onSubmit: PageFormSubmitHandler<Instance> = async (editedInstance) => {
    editedInstance.capacity_adjustment = (Math.round(
      (editedInstance.capacity_adjustment as unknown as number) * 100
    ) / 100) as unknown as string;
    await requestPatch<Instance>(awxAPI`/instances/${id.toString()}/`, editedInstance);
    (cache as unknown as { clear: () => void }).clear?.();
    navigate(-1);
  };
  const onCancel = () => navigate(-1);

  const getPageUrl = useGetPageUrl();

  if (!instance) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
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
            { label: t('Instances'), to: getPageUrl(AwxRoute.Instances) },
            { label: instance.hostname },
          ]}
        />
        <AwxPageForm<Instance>
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
        </AwxPageForm>
      </PageLayout>
    );
  }
}
