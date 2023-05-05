import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { API_PREFIX } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';

export function EditGroup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Group } = useGet<EdaGroup>(`${API_PREFIX}/groups/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaGroup>, EdaGroup>();
  const patchRequest = usePatchRequest<Partial<EdaGroup>, EdaGroup>();

  const onSubmit: PageFormSubmitHandler<EdaGroup> = async (Group) => {
    if (Number.isInteger(id)) {
      Group = await patchRequest(`${API_PREFIX}/groups/${id}/`, Group);
      navigate(-1);
    } else {
      const newGroup = await postRequest(`${API_PREFIX}/groups/`, Group);
      navigate(RouteObj.EdaGroupDetails.replace(':id', newGroup.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!Group) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Groups'), to: RouteObj.EdaGroups },
              { label: t('Edit Group') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Group')}
            breadcrumbs={[
              { label: t('Groups'), to: RouteObj.EdaGroups },
              { label: t('Edit Group') },
            ]}
          />
          <PageForm<EdaGroup>
            submitText={t('Save group')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Group}
          >
            <PageFormTextInput<EdaGroup> name="name" label={t('Name')} isRequired />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Group')}
          breadcrumbs={[
            { label: t('Groups'), to: RouteObj.EdaGroups },
            { label: t('Create Group') },
          ]}
        />
        <PageForm<EdaGroup>
          submitText={t('Create group')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormTextInput<EdaGroup> name="name" label={t('Name')} isRequired />
        </PageForm>
      </PageLayout>
    );
  }
}
