import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework/PageForm/Inputs/PageFormTextInput';
import { PageForm, PageFormSubmitHandler } from '../../../../framework/PageForm/PageForm';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { RouteObj } from '../../../Routes';
import { PageFormOrganizationSelect } from '../../access/organizations/components/PageFormOrganizationSelect';
import { getOrganizationByName } from '../../access/organizations/utils/getOrganizationByName';
import { getAwxError } from '../../useAwxView';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { Inventory } from '../../interfaces/Inventory';
import { requestPatch } from '../../../common/crud/Data';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { FieldValues } from 'react-hook-form';

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
    console.log(
      '🚀 ~ file: InventoryForm.tsx:30 ~ constonSubmit:PageFormSubmitHandler<InventoryFields>= ~ inventory:',
      inventory
    );
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
      const newInventory = await postRequest('/api/v2/inventories/', inventory);
      const igRequests = [];
      for (const ig of instanceGroups || []) {
        igRequests.push(
          postRequest(`/api/v2/inventories/${newInventory.id.toString()}/instance_groups/`, {
            id: ig.id,
          })
        );
      }
      await Promise.all(igRequests);
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
  const onSubmit: PageFormSubmitHandler<Inventory> = async (editedInventory, setError) => {
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
      await requestPatch<Inventory>(`/api/v2/inventories/${id}/`, editedInventory);
      navigate(-1);
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
        defaultValue={inventory}
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
      <PageFormOrganizationSelect<InventoryFields>
        name="inventory.summary_fields.organization.name"
        isRequired
      />
      <PageFormInstanceGroupSelect<InventoryFields> name="instanceGroups" />
    </>
  );
}
