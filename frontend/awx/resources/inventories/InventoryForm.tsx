import { FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageFormCheckbox, PageHeader, PageLayout } from '../../../../framework';
import { PageFormGroup } from '../../../../framework/PageForm/Inputs/PageFormGroup';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { RouteObj } from '../../../Routes';
import { ItemsResponse, postRequest, requestPatch } from '../../../common/crud/Data';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Inventory } from '../../interfaces/Inventory';
import { Label } from '../../interfaces/Label';
import { getAwxError } from '../../useAwxView';

interface InventoryFields extends FieldValues {
  inventory: Inventory;
  instanceGroups?: InstanceGroup[];
  id: number;
}

export function CreateInventory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const postRequest = usePostRequest<{ id: number }, Inventory>();

  const onSubmit: PageFormSubmitHandler<InventoryFields> = async (values, setError) => {
    const { inventory, instanceGroups } = values;
    try {
      if (inventory.summary_fields.organization.name) {
        try {
          const organization = await getOrganizationByName(
            inventory.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          inventory.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      }
      // Create new inventory
      const newInventory = await postRequest('/api/v2/inventories/', inventory);

      // Update new inventory with selected instance groups
      await submitInstanceGroups(newInventory, instanceGroups ?? [], []);

      // Update new inventory with selected labels
      await submitLabels(newInventory, inventory.summary_fields.labels.results);

      navigate(
        RouteObj.InventoryDetails.replace(':inventory_type', 'inventory').replace(
          ':id',
          (newInventory.id ?? 0).toString()
        )
      );
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  return (
    <PageLayout>
      <PageHeader
        title={t('Create inventory')}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteObj.Inventories },
          { label: t('Create inventory') },
        ]}
      />
      <PageForm
        submitText={t('Create inventory')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
      >
        <InventoryInputs />
      </PageForm>
    </PageLayout>
  );
}

export function EditInventory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: inventory } = useGet<Inventory>(`/api/v2/inventories/${id.toString()}/`);
  const { data: igResponse } = useGet<ItemsResponse<InstanceGroup>>(
    `/api/v2/inventories/${id.toString()}/instance_groups/`
  );
  // Fetch instance groups associated with the inventory
  const instanceGroups = igResponse?.results;
  const onSubmit: PageFormSubmitHandler<InventoryFields> = async (values, setError) => {
    const { inventory: editedInventory } = values;
    try {
      if (editedInventory.summary_fields.organization.name) {
        try {
          const organization = await getOrganizationByName(
            editedInventory.summary_fields.organization.name
          );
          if (!organization) throw new Error(t('Organization not found.'));
          editedInventory.organization = organization.id;
        } catch {
          throw new Error(t('Organization not found.'));
        }
      }
      // Update the inventory
      const updatedInventory = await requestPatch<Inventory>(
        `/api/v2/inventories/${id.toString()}/`,
        editedInventory
      );

      // Update inventory with selected instance groups
      await submitInstanceGroups(
        updatedInventory,
        values.instanceGroups ?? [],
        instanceGroups ?? []
      );

      // Update inventory with selected labels
      await submitLabels(updatedInventory, editedInventory.summary_fields.labels.results);
      navigate(
        RouteObj.InventoryDetails.replace(':inventory_type', 'inventory').replace(
          ':id',
          (updatedInventory.id ?? 0).toString()
        )
      );
    } catch (err) {
      setError(await getAwxError(err));
    }
  };
  if (!inventory) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Inventories'), to: RouteObj.Inventories },
            { label: t('Edit inventory') },
          ]}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit inventory')}
        breadcrumbs={[
          { label: t('Inventories'), to: RouteObj.Inventories },
          { label: t('Edit inventory') },
        ]}
      />
      <PageForm
        submitText={t('Save inventory')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={{ inventory, instanceGroups }}
      >
        <InventoryInputs />
      </PageForm>
    </PageLayout>
  );
}

function InventoryInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput
        name="inventory.name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
      />
      <PageFormTextInput
        label={t('Description')}
        name="inventory.description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<InventoryFields>
        name="inventory.summary_fields.organization"
        isRequired
      />
      <PageFormInstanceGroupSelect<InventoryFields>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this inventory to run on.`)}
      />
      <PageFormLabelSelect
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this inventory, such as 'dev' or 'test'. Labels can be used to group and filter inventories and completed jobs.`
        )}
        name="inventory.summary_fields.labels.results"
      />
      <PageFormGroup
        label={t('Options')}
        labelHelp={t(
          'If enabled, the inventory will prevent adding any organization instance groups to the list of preferred instances groups to run associated job templates on. Note: If this setting is enabled and you provided an empty list, the global instance groups will be applied.'
        )}
      >
        <PageFormCheckbox
          label={t('Prevent instance group fallback')}
          name="inventory.prevent_instance_group_fallback"
        />
      </PageFormGroup>
    </>
  );
}

async function submitLabels(inventory: Inventory, labels: Label[]) {
  const { added, removed } = getAddedAndRemoved(
    inventory.summary_fields?.labels?.results || ([] as Label[]),
    labels ?? ([] as Label[])
  );

  const disassociationPromises = removed.map((label: { id: number }) =>
    postRequest(`/api/v2/inventories/${inventory.id.toString()}/labels/`, {
      id: label.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((label: { name: string }) =>
    postRequest(`/api/v2/inventories/${inventory.id.toString()}/labels/`, {
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
    postRequest(`/api/v2/inventories/${inventory.id.toString()}/instance_groups/`, {
      id: instanceGroup.id,
      disassociate: true,
    })
  );
  const associationPromises = added.map((instanceGroup: { id: number }) =>
    postRequest(`/api/v2/inventories/${inventory.id.toString()}/instance_groups/`, {
      id: instanceGroup.id,
    })
  );

  const results = await Promise.all([...disassociationPromises, ...associationPromises]);
  return results;
}
