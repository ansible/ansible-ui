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
import { ICatalogBreadcrumb } from '../../../../../framework';
import { PageFormAsyncSingleSelect } from '../../../../../framework/PageForm/Inputs/PageFormAsyncSingleSelect';
import { requestGet } from '../../../../common/crud/Data';
import { useCallback } from 'react';
import { Inventory } from '../../../interfaces/Inventory';
import { AwxItemsResponse } from '../../../common/AwxItemsResponse';
import { PageAsyncSingleSelectOptionsFn } from '../../../../../framework/PageInputs/PageAsyncSingleSelect';

export interface IHostInput {
  name: string;
  description?: string;
  variables?: string;
  inventory?: { name?: string; id?: number };
}

export function CreateHost() {
  const [groupName, setGroupName] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useHostParams('create');

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
    const inventory_id = params.id || hostInput.inventory?.id;

    const modifiedHostInput = { ...hostInput, inventory: Number(inventory_id) };
    const newHost = params?.group_id
      ? await postRequest(awxAPI`/groups/${params.group_id}/hosts/`, modifiedHostInput as AwxHost)
      : await postRequest(awxAPI`/hosts/`, modifiedHostInput as AwxHost);

    if (params.inventory_host) {
      pageNavigate(AwxRoute.InventoryHostDetails, {
        params: { inventory_type: params.inventory_type, id: inventory_id, host_id: newHost.id },
      });
    } else {
      pageNavigate(AwxRoute.Hosts);
    }
  };

  const onCancel = () => navigate(-1);

  const inventoryResponse = useGetInventory(params.id, params.inventory_type);

  let breadcrumbs: ICatalogBreadcrumb[] = [];

  if (params.inventory_host) {
    breadcrumbs = [
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
    ];
  } else {
    breadcrumbs = [
      {
        label: t('Hosts'),
        to: getPageUrl(AwxRoute.Hosts),
      },
      { label: t('Create') },
    ];
  }

  return (
    <PageLayout>
      <PageHeader breadcrumbs={breadcrumbs} title={t('Create Host')} />
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
        <HostInputs edit_mode={false} inventory_host={params.inventory_host} />
      </AwxPageForm>
    </PageLayout>
  );
}

function useHostParams(mode: 'edit' | 'create'): {
  id?: string;
  inventory_type?: string;
  host_id?: string;
  group_id?: string;
  inventory_host: boolean;
} {
  const params = useParams<{
    id: string;
    inventory_type: string;
    host_id: string;
    group_id: string;
  }>();

  let id = params.id;
  let host_id = params.host_id;

  let inventory_host = false;

  if (!host_id && mode === 'edit') {
    // this means the form was opened from host list, which passes host_id as id, so we have to rename it
    host_id = id;
    id = undefined;
  }

  if (id) {
    inventory_host = true;
  }

  return {
    id,
    host_id,
    inventory_type: params.inventory_type,
    group_id: params.group_id,
    inventory_host,
  };
}

export function EditHost() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useHostParams('edit');

  const { host: hostResponse } = useGetHost(params.host_id ?? '');

  const [host, setHost] = useState<AwxHost | undefined>(hostResponse);

  useEffect(() => setHost(hostResponse), [hostResponse]);

  const onSubmit: PageFormSubmitHandler<IHostInput> = async (hostInput: IHostInput) => {
    await requestPatch<AwxHost>(awxAPI`/hosts/${params.host_id ?? ''}/`, hostInput);

    if (params.inventory_host) {
      pageNavigate(AwxRoute.InventoryHostDetails, {
        params: { inventory_type: params.inventory_type, id: params.id, host_id: params.host_id },
      });
    } else {
      pageNavigate(AwxRoute.Hosts);
    }
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
    inventory: { name: host.summary_fields?.inventory.name },
  };

  let breadcrumbs: ICatalogBreadcrumb[] = [];

  if (params.inventory_host) {
    breadcrumbs = [
      { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
      {
        label: t(`${hostResponse?.summary_fields?.inventory.name}`),
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
    ];
  } else {
    breadcrumbs = [
      {
        label: t('Hosts'),
        to: getPageUrl(AwxRoute.Hosts),
      },
      { label: t('Edit') },
    ];
  }

  return (
    <PageLayout>
      <PageHeader breadcrumbs={breadcrumbs} title={t('Edit host')} />
      <AwxPageForm<IHostInput>
        submitText={t('Save host')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={defaultValue}
      >
        <HostInputs edit_mode={true} inventory_host={params.inventory_host} />
      </AwxPageForm>
    </PageLayout>
  );
}

function HostInputs(props: { edit_mode?: boolean; inventory_host?: boolean }) {
  const { t } = useTranslation();

  const queryOptions = useCallback<PageAsyncSingleSelectOptionsFn<number>>(
    async (page: number, signal: AbortSignal) => {
      const response = await requestGet<AwxItemsResponse<Inventory>>(awxAPI`/inventories/`);

      return Promise.resolve({
        total: response.count,
        options:
          response.results?.map((resource) => ({
            label: resource.name,
            value: resource.id as number,
            description: resource.description,
          })) ?? [],
      });
    },
    []
  );

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
      {!props.inventory_host && props.edit_mode && (
        <PageFormTextInput<IHostInput>
          name="inventory.name"
          label={t('Inventory')}
          isDisabled={true}
        />
      )}
      {!props.inventory_host && !props.edit_mode && (
        <PageFormAsyncSingleSelect
          name="inventory.id"
          label={t('Inventory')}
          placeholder={t('Select Inventory')}
          queryOptions={queryOptions}
        />
      )}
      <PageFormSection singleColumn>
        <PageFormDataEditor<IHostInput> format="yaml" name="variables" label={t('Variables')} />
      </PageFormSection>
    </>
  );
}
