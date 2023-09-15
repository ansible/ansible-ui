import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '../../../common/useInvalidateCache';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';

export function EditGroup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
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
      pageNavigate(EdaRoute.GroupPage, { params: { id: newGroup.id } });
    }
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (Number.isInteger(id)) {
    if (!Group) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Groups'), to: getPageUrl(EdaRoute.Groups) },
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
              { label: t('Groups'), to: getPageUrl(EdaRoute.Groups) },
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
            { label: t('Groups'), to: getPageUrl(EdaRoute.Groups) },
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
