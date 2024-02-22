/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageFormSection } from '../../../../../framework/PageForm/Utils/PageFormSection';
import { requestPatch } from '../../../../common/crud/Data';
import { useGetRequest } from '../../../../common/crud/useGet';
import { usePostRequest } from '../../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../../common/AwxPageForm';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxHost } from '../../../interfaces/AwxHost';
import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetHost } from '../../hosts/hooks/useGetHost';
import { useGetInventory } from '../InventoryPage/InventoryPage';

export interface IHostInput {
  name: string;
  description?: string;
  variables?: string;
}

export function CreateHost() {
  const [groupName, setGroupName] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{
    id: string;
    inventory_type: string;
    host_id: string;
    group_id: string;
  }>();
  const postRequest = usePostRequest<AwxHost>();
  const getRequest = useGetRequest<InventoryGroup>();

  useEffect(() => {
    async function getGroup() {
      if (params?.group_id) {
        const group = await getRequest(awxAPI`/groups/${params?.group_id}/`);
        if (group?.name) {
          setGroupName(group.name);
        }
      }
    }

    void (async () => {
      await getGroup();
    })();
  }, [getRequest, params?.group_id]);

  const onSubmit: PageFormSubmitHandler<IHostInput> = async (hostInput: IHostInput) => {
    const modifiedHostInput = { ...hostInput, inventory: Number(params.id) };
    const newHost = params?.group_id
      ? await postRequest(awxAPI`/groups/${params.group_id}/hosts/`, modifiedHostInput as AwxHost)
      : await postRequest(awxAPI`/hosts/`, modifiedHostInput as AwxHost);
    pageNavigate(AwxRoute.InventoryHostDetails, {
      params: { inventory_type: params.inventory_type, id: params.id, host_id: newHost.id },
    });
  };

  const onCancel = () => navigate(-1);

  const inventoryResponse = useGetInventory(params.id, params.inventory_type);

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
          params?.group_id
            ? {
                label: t('Groups'),
                id: 'group',
                to: getPageUrl(AwxRoute.InventoryGroups, {
                  params: {
                    id: params.group_id,
                    inventory_type: params.inventory_type,
                  },
                }),
              }
            : {
                label: t('Hosts'),
                id: 'hosts',
                to: getPageUrl(AwxRoute.InventoryHosts, {
                  params: {
                    id: params.id,
                    inventory_type: params.inventory_type,
                    host_id: params.host_id,
                  },
                }),
              },
          params?.group_id
            ? {
                label: t(`${groupName}`),
                to: getPageUrl(AwxRoute.InventoryGroupDetails, {
                  params: {
                    id: params.group_id,
                    inventory_type: params.inventory_type,
                    group_id: params.group_id,
                  },
                }),
              }
            : {},
          { label: t('Add') },
        ]}
        title={t('Create Host')}
      />
      <AwxPageForm
        submitText={t('Create host')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: '',
          description: '',
          variables: '---\n',
        }}
      >
        <HostInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const { host: hostResponse } = useGetHost(params.host_id ?? '');
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
        <PageFormDataEditor<IHostInput> format="yaml" name="variables" label={t('Variables')} />
      </PageFormSection>
    </>
  );
}
