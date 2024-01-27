import { useTranslation } from 'react-i18next';
import {
  LoadingPage,
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { AwxRoute } from '../../main/AwxRoutes';
import { useNavigate, useParams } from 'react-router-dom';
import { useGet } from '../../../common/crud/useGet';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxError } from '../../common/AwxError';
import { InventoryGroupCreate } from '../../interfaces/InventoryGroupCreate';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { Inventory } from '../../interfaces/Inventory';
import { AwxPageForm } from '../../common/AwxPageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';

export function GroupPageAdd() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<InventoryGroupCreate, InventoryGroup>();
  const params = useParams<{ id: string }>();
  const {
    error,
    data: inventory,
    refresh,
  } = useGet<Inventory>(awxAPI`/inventories/${params.id?.toString() ?? ''}`);

  const onSubmit: PageFormSubmitHandler<InventoryGroupCreate> = async (groupInput) => {
    const { name, description, variables } = groupInput;
    const createGroup: InventoryGroupCreate = {
      name,
      description: description ?? '',
      inventory: inventory?.id ?? 0,
      variables: variables ?? '',
    };
    const newGroup = await postRequest(awxAPI`/groups/`, createGroup);
    pageNavigate(AwxRoute.InventoryGroupDetails, {
      params: { inventory_type: 'inventory', id: newGroup.inventory, group_id: newGroup.id },
    });
  };

  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!inventory) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Create new group')}
        breadcrumbs={[
          { label: t('Inventories'), to: getPageUrl(AwxRoute.Inventories) },
          {
            label: `${inventory?.name}`,
            to: getPageUrl(AwxRoute.InventoryDetails, {
              params: {
                id: inventory?.id,
                inventory_type: 'inventory',
              },
            }),
          },
          {
            label: t('Groups'),
            to: getPageUrl(AwxRoute.InventoryGroups, {
              params: {
                id: inventory?.id,
                inventory_type: 'inventory',
              },
            }),
          },
        ]}
      />
      <AwxPageForm<InventoryGroupCreate>
        submitText={t('Save')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={{
          name: '',
          description: '',
          variables: '---\n',
        }}
      >
        <PageFormTextInput name="name" label={t('Name')} placeholder={t('Enter name')} isRequired />
        <PageFormTextInput
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
        />
        <PageFormSection singleColumn>
          <PageFormDataEditor
            name="variables"
            label={t('Variables')}
            toggleLanguages={['yaml', 'json']}
          />
        </PageFormSection>
      </AwxPageForm>
    </PageLayout>
  );
}
