import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormCheckbox,
  PageFormDataEditor,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { postRequest, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { awxAPI } from '../../common/api/awx-utils';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Inventory } from '../../interfaces/Inventory';
import { Label } from '../../interfaces/Label';
import { AwxRoute } from '../../main/AwxRoutes';
import { requestGet } from '../../../common/crud/Data';
import { PageFormMultiSelectAwxResource } from '../../common/PageFormMultiSelectAwxResource';
import { useInventoriesColumns } from './hooks/useInventoriesColumns';
import { useInventoriesFilters } from './hooks/useInventoriesFilters';
import { TFunction } from 'i18next';
import { PageFormSingleSelect } from '../../../../framework/PageForm/Inputs/PageFormSingleSelect';
import { AwxError } from '../../common/AwxError';
import { ConstructedInventoryHint } from './components/ConstructedInventoryHint';


// TODO - filter for query string not__kind=smart&not__kind=constructed

export type InventoryCreate = Inventory & {
  instanceGroups: InstanceGroup[];
  labels: Label[];
  inventories?: number[];
  inputInventories?: InputInventory[];
};

const kinds: { [key: string]: string } = {
  '': 'inventory',
  smart: 'smart_inventory',
  constructed: 'constructed_inventory',
};

export function CreateInventory(props: { inventoryKind: '' | 'constructed' | 'smart' }) {
  const { t } = useTranslation();
  const { inventoryKind } = props;
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Inventory, Inventory>();

  const onSubmit: PageFormSubmitHandler<InventoryCreate> = async (data) => {
    const { instanceGroups, ...inventory } = data;

    let inputInventories: InputInventory[] = [];
    if (props.inventoryKind === 'constructed') {
      inputInventories = await loadInputInventories(data.inventories || [], t);
      data.inputInventories = inputInventories;
    }

    const urlType =
      props.inventoryKind === 'constructed' ? 'constructed_inventories' : 'inventories';
    const newInventory = await postRequest(awxAPI`/${urlType}/`, inventory);

    const promises: Promise<unknown>[] = [];
    // Update new inventory with selected instance groups
    if (instanceGroups?.length > 0)
      promises.push(submitInstanceGroups(newInventory, instanceGroups ?? [], []));

    // Update new inventory with selected input inventories
    if (data?.inventories?.length && data.inventories.length > 0) {
      promises.push(submitInputInventories(newInventory, inputInventories || [], []));
    }

    // Update new inventory with selected labels
    if (newInventory.kind === '' && data.labels.length > 0)
      promises.push(submitLabels(newInventory, data.labels));

    await Promise.all(promises);

    pageNavigate(AwxRoute.InventoryDetails, {
      params: { inventory_type: kinds[newInventory.kind], id: newInventory.id },
    });
  };

  const getPageUrl = useGetPageUrl();
  const title =
    inventoryKind === ''
      ? t('Create Inventory')
      : inventoryKind === 'smart'
        ? t('Create Smart Inventory')
        : t('Create Constructed Inventory');

  const defaultValue =
    inventoryKind === 'smart'
      ? {
          kind: inventoryKind,
          name: '',
          description: '',
          instanceGroups: [],
          variables: '---\n',
        }
      : inventoryKind === 'constructed'
        ? {
            kind: inventoryKind,
            name: '',
            description: '',
            instanceGroups: [],
            inputInventories: [],
            verbosity: 0,
            update_cache_timeout: 0,
            limit: '',
          }
        : {
            kind: inventoryKind,
            name: '',
            description: '',
            instanceGroups: [],
            labels: [],
            variables: '---\n',
            prevent_instance_group_fallback: false,
          };

  return (
    <PageLayout>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: title },
        ]}
      />
      <AwxPageForm
        submitText={t('Create inventory')}
        onSubmit={onSubmit}
        onCancel={() => pageNavigate(AwxRoute.Inventories)}
        defaultValue={defaultValue}
      >
        <InventoryInputs inventoryKind={inventoryKind} />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditInventory() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string; inventory_type: string }>();
  const id = Number(params.id);

  const urlType =
    params.inventory_type === 'constructed_inventory' ? 'constructed_inventories' : 'inventories';

  const inventoryRequest = useGet<Inventory>(awxAPI`/${urlType}/${id.toString()}/`);
  const iGroupsRequest = useGet<AwxItemsResponse<InstanceGroup>>(
    awxAPI`/inventories/${id.toString()}/instance_groups/`
  );

  const inventory = inventoryRequest.data;
  const igResponse = iGroupsRequest.data;

  const inputInventoriesUrl =
    params.inventory_type === 'constructed_inventory'
      ? awxAPI`/inventories/${id.toString()}/input_inventories/`
      : '';
  const inputInventoriesRequest = useGet<AwxItemsResponse<InputInventory>>(inputInventoriesUrl);

  const inputInventoriesResponse = inputInventoriesRequest.data;

  // Fetch instance groups associated with the inventory
  const originalInstanceGroups = igResponse?.results;
  const onSubmit: PageFormSubmitHandler<InventoryCreate> = async (data) => {
    const { organization, labels, instanceGroups, ...editedInventory } = data;

    let inputInventories: InputInventory[] = [];
    if (params.inventory_type === 'constructed_inventory') {
      inputInventories = await loadInputInventories(data.inventories || [], t);
      data.inputInventories = inputInventories;
    }

    // Update the inventory
    const updatedInventory = await requestPatch<Inventory>(
      awxAPI`/${urlType}/${id.toString()}/`,
      editedInventory
    );
    const promises = [];
    // Update inventory with selected instance groups
    promises.push(
      submitInstanceGroups(updatedInventory, instanceGroups ?? [], originalInstanceGroups ?? [])
    );

    promises.push(submitLabels(inventory as Inventory, labels || []));

    // Update new inventory with selected input inventories
    if (data?.inventories?.length && data.inventories.length > 0) {
      promises.push(
        submitInputInventories(
          data,
          inputInventories || [],
          inputInventoriesResponse?.results || []
        )
      );
    }

    await Promise.all(promises);

    pageNavigate(AwxRoute.InventoryDetails, {
      params: { id: updatedInventory.id, inventory_type: params.inventory_type },
    });
  };

  const getPageUrl = useGetPageUrl();

  const isLoaded =
    inventory &&
    igResponse &&
    (params.inventory_type === 'constructed_inventory' ? inputInventoriesResponse : true)
      ? true
      : false;

  const isError = inventoryRequest.error || iGroupsRequest.error || inputInventoriesRequest.error;

  if (!isLoaded || !inventory || isError) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
            { label: t('Edit Inventory') },
          ]}
        />
        {!isLoaded && !isError && <LoadingPage></LoadingPage>}
        {inventoryRequest.error && <AwxError error={inventoryRequest.error} />}
        {iGroupsRequest.error && <AwxError error={iGroupsRequest.error} />}
        {inputInventoriesRequest.error && <AwxError error={inputInventoriesRequest.error} />}
      </PageLayout>
    );
  }

  const title =
    inventory.kind === ''
      ? t('Edit Inventory')
      : inventory.kind === 'smart'
        ? t('Edit Smart Inventory')
        : t('Edit Constructed Inventory');

  const defaultValue =
    inventory.kind === 'smart'
      ? { ...inventory, instanceGroups: originalInstanceGroups }
      : inventory.kind === 'constructed'
        ? {
            ...inventory,
            instanceGrous: originalInstanceGroups,
            inventories: inputInventoriesResponse?.results?.map((item) => item.id),
          }
        : {
            ...inventory,
            instanceGroups: originalInstanceGroups,
            labels: inventory.summary_fields?.labels?.results ?? [],
          };

  return (
    <PageLayout>
      <PageHeader
        title={title}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: title },
        ]}
      />
      <AwxPageForm<InventoryCreate>
        submitText={t('Save inventory')}
        onSubmit={onSubmit}
        onCancel={() =>
          pageNavigate(AwxRoute.InventoryDetails, {
            params: { id, inventory_type: kinds[inventory.kind] },
          })
        }
        defaultValue={defaultValue}
      >
        <InventoryInputs inventoryKind={inventory.kind} />
      </AwxPageForm>
    </PageLayout>
  );
}

function InventoryInputs(props: { inventoryKind: string }) {
  const { t } = useTranslation();
  const { inventoryKind } = props;
  return (
    <>
      <PageFormTextInput<InventoryCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput<InventoryCreate>
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<InventoryCreate> name="organization" isRequired />
      {inventoryKind === 'smart' && (
        <PageFormTextInput<InventoryCreate>
          name="host_filter"
          label={t('Smart host filter')}
          labelHelp={t(
            `Populate the hosts for this inventory by using a search filter. Example: ansible_facts__ansible_distribution:"RedHat". Refer to the Ansible Controller documentation for further syntax and examples.`
          )}
          placeholder={t('Enter smart host filter')}
          isRequired
        />
      )}
      <PageFormInstanceGroupSelect<InventoryCreate>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this inventory to run on.`)}
      />
      {inventoryKind === 'constructed' && (
        <>
          <PageFormMultiSelectInventories />
          <PageFormTextInput
            name="update_cache_timeout"
            id="update_cache_timeout"
            type="number"
            label={t(`Cache timeout (seconds)`)}
            labelHelp={t(
              `The cache timeout for the related auto-created inventory source, special to constructed inventory`
            )}
            validate={(item) =>
              Number.parseFloat(item) >= 0
                ? undefined
                : t('This field must be a number and have a value between 0 and 2147483647')
            }
          />
          <PageFormSingleSelect
            name="verbosity"
            id="verbosity"
            label={t(`Verbosity`)}
            placeholder={''}
            labelHelp={t(
              'The verbosity level for the related auto-created inventory source, special to constructed inventory'
            )}
            options={[
              { value: 0, label: t('0 (Normal)') },
              { value: 1, label: t('1 (Verbose)') },
              { value: 2, label: t('2 (More Verbose)') },
              { value: 3, label: t('3 (Debug)') },
              { value: 4, label: t('4 (Connection Debug)') },
              { value: 5, label: t('5 (WinRM Debug)') },
            ]}
          />
          <PageFormSection singleColumn>
            <ConstructedInventoryHint/>
          </PageFormSection>
          <PageFormTextInput
            name="limit"
            id="limit"
            label={t(`Limit`)}
            labelHelp={t(
              `The limit to restrict the returned hosts for the related auto-created inventory source, special to constructed inventory.`
            )}
          />        
        </>
      )}
      {inventoryKind === '' && (
        <PageFormLabelSelect<InventoryCreate>
          labelHelpTitle={t('Labels')}
          labelHelp={t(
            `Optional labels that describe this inventory, such as 'dev' or 'test'. Labels can be used to group and filter inventories and completed jobs.`
          )}
          name="labels"
        />
      )}
      <PageFormSection singleColumn>
        <PageFormDataEditor<InventoryCreate>
          name="variables"
          label={t('Variables')}
          format="yaml"
        />
      </PageFormSection>
      {inventoryKind === '' && (
        <PageFormGroup
          label={t('Options')}
          labelHelp={t(
            'If enabled, the inventory will prevent adding any organization instance groups to the list of preferred instances groups to run associated job templates on. Note: If this setting is enabled and you provided an empty list, the global instance groups will be applied.'
          )}
        >
          <PageFormCheckbox<InventoryCreate>
            label={t('Prevent instance group fallback')}
            name="prevent_instance_group_fallback"
          />
        </PageFormGroup>
      )}
    </>
  );
}

async function submitLabels(inventory: Inventory, labels: Label[]) {
  const { added, removed } = getAddedAndRemoved(
    inventory.summary_fields?.labels?.results || ([] as Label[]),
    labels ?? ([] as Label[])
  );

  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/labels/`, {
      name: label.name,
      organization: inventory.organization,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}

async function submitInstanceGroups(
  inventory: Inventory,
  currentInstanceGroups: InstanceGroup[],
  originalInstanceGroups: InstanceGroup[]
) {
  const { added, removed } = getAddedAndRemoved(
    originalInstanceGroups ?? ([] as InstanceGroup[]),
    currentInstanceGroups ?? ([] as InstanceGroup[])
  );

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  const disassociationPromises = removed.map((instanceGroup: { id: number }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/instance_groups/`, {
      id: instanceGroup.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((instanceGroup: { id: number }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/instance_groups/`, {
      id: instanceGroup.id,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}

async function submitInputInventories(
  inventory: Inventory,
  currentInputInventories: InputInventory[],
  originalInputInventories: InputInventory[]
) {
  const { added, removed } = getAddedAndRemoved(
    originalInputInventories ?? ([] as InputInventory[]),
    currentInputInventories ?? ([] as InputInventory[])
  );

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  const disassociationPromises = removed.map((item: { id: number }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/input_inventories/`, {
      id: item.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((item: { id: number }) =>
    postRequest(awxAPI`/inventories/${inventory.id.toString()}/input_inventories/`, {
      id: item.id,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}

type InputInventory = { id: number; url: string; type: string; name: string };

async function loadInputInventories(inventories: number[], t: TFunction<'translation', undefined>) {
  const promises: unknown[] = [];
  const inventoriesData: InputInventory[] = inventories.map((inv) => {
    return { id: inv, url: '', type: '', name: '' };
  });

  inventories.forEach((id) => {
    const promise = requestGet<AwxItemsResponse<Inventory>>(
      awxAPI`/inventories/?id=${id.toString()}`
    )
      .then((result: AwxItemsResponse<Inventory>) => {
        if (result.results.length > 0) {
          const inv = inventoriesData.find((inv) => inv.id === id);
          if (inv) {
            inv.url = result.results[0].url || '';
            inv.type = result.results[0].type || '';
          }
        }
      })
      .catch(() => {
        throw new Error(t(`Error loading input inventory with id {{id}}.`, { id: id }));
      });

    promises.push(promise);
  });

  await Promise.all(promises);
  return inventoriesData;
}

function PageFormMultiSelectInventories() {
  const filters = useInventoriesFilters();
  const columns = useInventoriesColumns();
  const { t } = useTranslation();
  return (
    <PageFormMultiSelectAwxResource<Inventory>
      name={'inventories'}
      id={'inventories'}
      label={t('Inventories')}
      placeholder={t('Select inventories')}
      queryPlaceholder={t('Loading inventories...')}
      queryErrorText={t('Error loading inventories')}
      isRequired={true}
      labelHelp={t(`Select Input Inventories for the constructed inventory plugin.`)}
      url={awxAPI`/inventories/`}
      tableColumns={columns}
      toolbarFilters={filters}
      queryParams={{ kind: '' }}
    />
  );
}
