import { useTranslation } from 'react-i18next';
import { AwxPageForm } from '../../common/AwxPageForm';
import { InventoryGroup, InventoryGroupCreate } from '../../interfaces/InventoryGroup';
import {
  PageFormDataEditor,
  PageFormSubmitHandler,
  PageFormTextInput,
  usePageNavigate,
} from '../../../../framework';
import { PageFormSection } from '../../../../framework/PageForm/Utils/PageFormSection';
import { useNavigate } from 'react-router-dom';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { usePutRequest } from '../../../common/crud/usePutRequest';

export function GroupEdit(props: { group: InventoryGroup }) {
  const { t } = useTranslation();
  const group = props.group;
  const navigate = useNavigate();
  const putRequest = usePutRequest<InventoryGroupCreate, InventoryGroup>();
  const pageNavigate = usePageNavigate();

  const onSubmit: PageFormSubmitHandler<InventoryGroupCreate> = async (groupInput) => {
    const { name, description, variables } = groupInput;
    const editGroup: InventoryGroupCreate = {
      name,
      description,
      variables,
      inventory: group.inventory,
    };
    const editedGroup = await putRequest(awxAPI`/groups/${group.id.toString()}`, editGroup);
    pageNavigate(AwxRoute.InventoryGroupDetails, {
      params: { inventory_type: 'inventroy', id: editedGroup.inventory, group_id: editedGroup.id },
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
        name: group.name,
        description: group?.description ?? '',
        variables: group?.variables ?? '---\n',
      }}
    >
      <PageFormTextInput name="name" label={t('Name')} isRequired />
      <PageFormTextInput name="description" label={t('Description')} />
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
