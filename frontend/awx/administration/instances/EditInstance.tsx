import {
  PageFormCheckbox,
  PageHeader,
  PageLayout,
  useGetPageUrl,
} from '@ansible/ansible-ui-framework';
import { PageFormSlider } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormSlider';
import { PageFormSubmitHandler } from '@ansible/ansible-ui-framework/PageForm/PageForm';
import { requestGet, requestPatch, swrOptions } from '@ansible/common-ui/crud/Data';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import useSWR from 'swr';
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

  const onSubmit: PageFormSubmitHandler<Instance> = async (editedInstance) => {
    editedInstance.capacity_adjustment = (Math.round(
      (editedInstance.capacity_adjustment as unknown as number) * 100
    ) / 100) as unknown as string;
    await requestPatch<Instance>(awxAPI`/instances/${id.toString()}/`, editedInstance);
    void navigate(-1);
  };
  const onCancel = () => void navigate(-1);

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
