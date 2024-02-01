import { useTranslation } from 'react-i18next';
import {
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  usePageNavigate,
} from '../../../../framework';
import { useNavigate, useParams } from 'react-router-dom';
import { InventoryGroupCreate, InventoryGroupRelatedGroup } from '../../interfaces/InventoryGroup';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { AwxPageForm } from '../../common/AwxPageForm';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { AwxRoute } from '../../main/AwxRoutes';
import { awxAPI } from '../../common/api/awx-utils';
import { InventoryGroup } from '../../interfaces/InventoryGroup';
import { Inventory } from '../../interfaces/Inventory';

export function GroupCreate(props: { inventory: Inventory }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<InventoryGroupCreate, InventoryGroup>();
  const postParentGroup = usePostRequest<InventoryGroupRelatedGroup>();
  const params = useParams<{ group_id: string }>();

  const onSubmit: PageFormSubmitHandler<InventoryGroupCreate> = async (groupInput) => {
    const { name, description, variables } = groupInput;
    const createGroup: InventoryGroupCreate = {
      name,
      description: description ?? '',
      inventory: props.inventory?.id ?? 0,
      variables: variables ?? '',
    };
    const newGroup = await postRequest(awxAPI`/groups/`, createGroup);

    if (params.group_id) {
      const parentGroup: InventoryGroupRelatedGroup = {
        id: newGroup.id,
      };
      await postParentGroup(awxAPI`/groups/${params.group_id}/children/`, parentGroup);
      pageNavigate(AwxRoute.InventoryGroupRelatedGroups, {
        params: { inventory_type: 'inventory', id: newGroup.inventory, group_id: params.group_id },
      });
    } else {
      pageNavigate(AwxRoute.InventoryGroupDetails, {
        params: { inventory_type: 'inventory', id: newGroup.inventory, group_id: newGroup.id },
      });
    }
  };

  const onCancel = () => navigate(-1);
  return (
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
  );
}
