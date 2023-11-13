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
import { AwxPageForm } from '../../AwxPageForm';
import { AwxRoute } from '../../AwxRoutes';
import { PageFormSelectOrganization } from '../../access/organizations/components/PageFormOrganizationSelect';
import { PageFormInstanceGroupSelect } from '../../administration/instance-groups/components/PageFormInstanceGroupSelect';
import { awxAPI } from '../../api/awx-utils';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { PageFormLabelSelect } from '../../common/PageFormLabelSelect';
import { getAddedAndRemoved } from '../../common/util/getAddedAndRemoved';
import { InstanceGroup } from '../../interfaces/InstanceGroup';
import { Inventory } from '../../interfaces/Inventory';
import { Label } from '../../interfaces/Label';

export interface InventoryFields {
  name: string;
  description: string;
  organization: { name: string; id: number };
  instanceGroups: InstanceGroup[];
  labels: Label[] | [];
  variables: string;
  prevent_instance_group_fallback: boolean;
}
export interface InventoryCreate {
  organization: number;
  name: string;
  description: string;
  variables: string;
  prevent_instance_group_fallback: boolean;
}

export function CreateInventory() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<InventoryCreate, Inventory>();

  const onSubmit: PageFormSubmitHandler<InventoryFields> = async (values) => {
    const { organization, labels, instanceGroups, ...rest } = values;

    const newInventory = await postRequest(awxAPI`/inventories/`, {
      ...rest,
      organization: organization.id,
    });

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
  const onSubmit: PageFormSubmitHandler<InventoryFields> = async (values) => {
    const { organization, labels, instanceGroups, ...rest } = values;

    // Update the inventory
    const updatedInventory = await requestPatch<Inventory>(awxAPI`/inventories/${id.toString()}/`, {
      ...rest,
      organization: organization.id,
    });
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
      <AwxPageForm<InventoryFields>
        submitText={t('Save inventory')}
        onSubmit={onSubmit}
        onCancel={() =>
          pageNavigate(AwxRoute.InventoryDetails, {
            params: { id, inventory_type: inventory.type },
          })
        }
        defaultValue={{
          name: inventory.name,
          description: inventory.description ?? '',
          instanceGroups: originalInstanceGroups,
          organization: inventory.summary_fields.organization,
          labels: inventory.summary_fields?.labels?.results ?? [],
          variables: inventory.variables ?? '---\n',
          prevent_instance_group_fallback: inventory.prevent_instance_group_fallback || false,
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
      <PageFormTextInput name="name" label={t('Name')} placeholder={t('Enter name')} isRequired />
      <PageFormTextInput
        label={t('Description')}
        name="description"
        placeholder={t('Enter description')}
      />
      <PageFormSelectOrganization<InventoryFields> name="organization" isRequired />
      <PageFormInstanceGroupSelect<InventoryFields>
        name="instanceGroups"
        labelHelp={t(`Select the instance groups for this inventory to run on.`)}
      />
      <PageFormLabelSelect
        labelHelpTitle={t('Labels')}
        labelHelp={t(
          `Optional labels that describe this inventory, such as 'dev' or 'test'. Labels can be used to group and filter inventories and completed jobs.`
        )}
        name="labels"
      />
      <PageFormSection singleColumn>
        <PageFormDataEditor<InventoryFields>
          toggleLanguages={['yaml', 'json']}
          name="variables"
          label={t('Variables')}
        />
      </PageFormSection>
      <PageFormGroup
        label={t('Options')}
        labelHelp={t(
          'If enabled, the inventory will prevent adding any organization instance groups to the list of preferred instances groups to run associated job templates on. Note: If this setting is enabled and you provided an empty list, the global instance groups will be applied.'
        )}
      >
        <PageFormCheckbox
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
