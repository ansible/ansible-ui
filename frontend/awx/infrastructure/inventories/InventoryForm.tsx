import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
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
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { AwxPageForm } from '../../common/AwxPageForm';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { awxAPI } from '../../common/api/awx-utils';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Inventory } from '../../interfaces/Inventory';
import { Label } from '../../interfaces/Label';
import { AwxRoute } from '../../main/AwxRoutes';
import { PageFormInstanceGroupSelect } from '../instance-groups/components/PageFormInstanceGroupSelect';

export type InventoryCreate = Inventory & {
  instanceGroups: InstanceGroup[];
  labels: Label[];
};

export function CreateInventory() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<Inventory, Inventory>();

  const onSubmit: PageFormSubmitHandler<InventoryCreate> = async (data) => {
    const { labels, instanceGroups, ...inventory } = data;

    const newInventory = await postRequest(awxAPI`/inventories/`, inventory);

    // Update new inventory with selected instance groups
    if (instanceGroups?.length > 0)
      await submitInstanceGroups(newInventory, instanceGroups ?? [], []);

    // Update new inventory with selected labels
    if (labels.length > 0) await submitLabels(newInventory, labels);

    pageNavigate(AwxRoute.InventoryDetails, {
      params: { inventory_type: newInventory.type, id: newInventory.id },
    });
  };

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Inventory')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: t('Create Inventory') },
        ]}
      />
      <AwxPageForm
        submitText={t('Create inventory')}
        onSubmit={onSubmit}
        onCancel={() => pageNavigate(AwxRoute.Inventories)}
        defaultValue={{
          name: '',
          description: '',
          instanceGroups: [],
          labels: [],
          variables: '---\n',
          prevent_instance_group_fallback: false,
        }}
      >
        <InventoryInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditInventory() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: inventory } = useGet<Inventory>(awxAPI`/inventories/${id.toString()}/`);
  const { data: igResponse } = useGet<AwxItemsResponse<InstanceGroup>>(
    awxAPI`/inventories/${id.toString()}/instance_groups/`
  );
  // Fetch instance groups associated with the inventory
  const originalInstanceGroups = igResponse?.results;
  const onSubmit: PageFormSubmitHandler<InventoryCreate> = async (data) => {
    const { organization, labels, instanceGroups, ...editedInventory } = data;

    // Update the inventory
    const updatedInventory = await requestPatch<Inventory>(
      awxAPI`/inventories/${id.toString()}/`,
      editedInventory
    );
    const promises = [];
    // Update inventory with selected instance groups
    promises.push(
      submitInstanceGroups(updatedInventory, instanceGroups ?? [], originalInstanceGroups ?? [])
    );
    promises.push(submitLabels(inventory as Inventory, labels || []));
    await Promise.all(promises);
    pageNavigate(AwxRoute.InventoryDetails, {
      params: { id: updatedInventory.id, inventory_type: updatedInventory.type },
    });
  };

  const getPageUrl = useGetPageUrl();

  if (!inventory) {
    return (
      <PageLayout>
        <PageHeader
          breadcrumbs={[
            { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
            { label: t('Edit Inventory') },
          ]}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title={t('Edit Inventory')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          { label: t('Edit Inventory') },
        ]}
      />
      <AwxPageForm<InventoryCreate>
        submitText={t('Save inventory')}
        onSubmit={onSubmit}
        onCancel={() =>
          pageNavigate(AwxRoute.InventoryDetails, {
            params: { id, inventory_type: inventory.type },
          })
        }
        defaultValue={{
          ...inventory,
          instanceGroups: originalInstanceGroups,
          labels: inventory.summary_fields?.labels?.results ?? [],
        }}
      >
        <InventoryInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

function InventoryInputs() {
  const { t } = useTranslation();
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
      <PageFormInstanceGroupSelect<InventoryCreate>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this inventory to run on.`)}
      />
      <PageFormLabelSelect<InventoryCreate>
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this inventory, such as 'dev' or 'test'. Labels can be used to group and filter inventories and completed jobs.`
        )}
        name="labels"
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<InventoryCreate>
          name="variables"
          label={t('Variables')}
          format="yaml"
        />
      </PageFormSection>
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
