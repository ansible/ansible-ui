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
import { useNavigate, useParams } from 'react-router-dom';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRoute } from '../../main/AwxRoutes';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { useGetItem } from '../../../common/crud/useGet';
import { useMemo } from 'react';

export function GroupEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const patchRequest = usePatchRequest<InventoryGroupCreate, InventoryGroup>();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ group_id: string }>();
  const { data: group } = useGetItem<InventoryGroup>(awxAPI`/groups/`, params.group_id);

  const defaultValue = useMemo(
    () => ({
      name: group?.name,
      description: group?.description ?? '',
      variables: group?.variables ?? '---\n',
    }),
    [group]
  );

  const onSubmit: PageFormSubmitHandler<InventoryGroupCreate> = async (groupInput) => {
    const { name, description, variables } = groupInput;
    const editGroup: InventoryGroupCreate = {
      name,
      description,
      variables,
      inventory: group?.inventory ?? 0,
    };
    const editedGroup = await patchRequest(
      awxAPI`/groups/${group?.id.toString() ?? ''}/`,
      editGroup
    );
    pageNavigate(AwxRoute.InventoryGroupDetails, {
      params: { inventory_type: 'inventroy', id: editedGroup.inventory, group_id: editedGroup.id },
    });
  };

  const onCancel = () => navigate(-1);
  if (!group) {
    return null;
  }

  return (
    <AwxPageForm<InventoryGroupCreate>
      submitText={t('Save')}
      onSubmit={onSubmit}
      cancelText={t('Cancel')}
      onCancel={onCancel}
      defaultValue={defaultValue}
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
