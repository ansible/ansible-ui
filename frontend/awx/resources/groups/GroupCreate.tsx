import { useTranslation } from 'react-i18next';
import {
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  usePageNavigate,
} from '../../../../framework';
import { useNavigate } from 'react-router-dom';
import { InventoryGroupCreate } from '../../interfaces/InventoryGroup';
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

  const onSubmit: PageFormSubmitHandler<InventoryGroupCreate> = async (groupInput) => {
    const { name, description, variables } = groupInput;
    const createGroup: InventoryGroupCreate = {
      name,
      description: description ?? '',
      inventory: props.inventory?.id ?? 0,
      variables: variables ?? '',
    };
    const newGroup = await postRequest(awxAPI`/groups/`, createGroup);
    pageNavigate(AwxRoute.InventoryGroupDetails, {
      params: { inventory_type: 'inventory', id: newGroup.inventory, group_id: newGroup.id },
    });
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
