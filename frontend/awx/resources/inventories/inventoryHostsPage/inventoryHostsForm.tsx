/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PageHeader, useGetPageUrl } from '../../../../../framework';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePageNavigate,
  PageFormSubmitHandler,
  PageLayout,
  PageFormTextInput,
  PageFormDataEditor,
} from '../../../../../framework';
import { requestPatch } from '../../../../common/crud/Data';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { useEffect, useState } from 'react';
import { useGetInventoryHost } from './inventoryHostsPage';
import { useGetInventory } from '../InventoryPage/InventoryPage';

export interface IHostInput {
  name: string;
  description?: string;
  variables?: string;
}

export function CreateHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const postRequest = usePostRequest<AwxHost>();

  const onSubmit: PageFormSubmitHandler<IHostInput> = async (hostInput: IHostInput) => {
    const modifiedHostInput = { ...hostInput, inventory: Number(params.id) };
    const newHost = await postRequest(awxAPI`/hosts/`, modifiedHostInput as AwxHost);
    pageNavigate(AwxRoute.InventoryHostDetails, {
      params: { inventory_type: params.inventory_type, id: params.id, host_id: newHost.id },
    });
  };

  const onCancel = () => navigate(-1);

  const inventoryResponse = useGetInventory(params.id, params.inventory_type);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: t(`${inventoryResponse?.name}`),
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: { id: params.id, inventory_type: params.inventory_type },
            }),
          },
          {
            label: t('Hosts'),
            to: getPageUrl(AwxRoute.InventoryHosts, {
              params: {
                id: params.id,
                inventory_type: params.inventory_type,
                host_id: params.host_id,
              },
            }),
          },
          { label: t('Add') },
        ]}
        title={t('Create Host')}
      />
      <AwxPageForm
        submitText={t('Create host')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <HostInputs />
      </AwxPageForm>
    </>
  );
}

export function EditHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const hostResponse = useGetInventoryHost(params.id, params.host_id);
  const inventoryResponse = useGetInventory(params.id, params.inventory_type);

  const [host, setHost] = useState<AwxHost | undefined>(hostResponse);

  useEffect(() => setHost(hostResponse), [hostResponse]);

  const onSubmit: PageFormSubmitHandler<IHostInput> = async (hostInput: IHostInput) => {
    await requestPatch<AwxHost>(awxAPI`/hosts/${params.host_id ?? ''}/`, hostInput);
    pageNavigate(AwxRoute.InventoryHostDetails, {
      params: { inventory_type: params.inventory_type, id: params.id, host_id: params.host_id },
    });
  };

  const onCancel = () => navigate(-1);

  if (!host) {
    return (
      <PageLayout>
        <PageHeader />
      </PageLayout>
    );
  }

  const defaultValue: Partial<IHostInput> = {
    name: host.name,
    description: host.description,
    variables: host.variables,
  };
  return (
    <PageLayout>
      <PageHeader
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: t(`${inventoryResponse?.name}`),
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: { id: params.id, inventory_type: params.inventory_type },
            }),
          },
          {
            label: t('Hosts'),
            to: getPageUrl(AwxRoute.InventoryHosts, {
              params: {
                id: params.id,
                inventory_type: params.inventory_type,
                host_id: params.host_id,
              },
            }),
          },
          {
            label: t(`${hostResponse?.name}`),
            to: getPageUrl(AwxRoute.InventoryHostDetails, {
              params: {
                id: params.id,
                inventory_type: params.inventory_type,
                host_id: params.host_id,
              },
            }),
          },
          { label: t('Edit') },
        ]}
        title={t('Edit host')}
      />
      <AwxPageForm<IHostInput>
        submitText={t('Save host')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <HostInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

function HostInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<IHostInput>
        name="name"
        label={t('Name')}
        placeholder={t('Enter a name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<IHostInput>
        name="description"
        label={t('Description')}
        placeholder={t('Enter a description')}
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<IHostInput>
          toggleLanguages={['yaml', 'json']}
          name="variables"
          label={t('Variables')}
        />
      </PageFormSection>
    </>
  );
}
