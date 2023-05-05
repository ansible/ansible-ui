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
import { EdaRole } from '../../interfaces/EdaRole';
import { usePatchRequest } from '../../../common/crud/usePatchRequest';

export function EditRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Role } = useGet<EdaRole>(`${API_PREFIX}/roles/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaRole>, EdaRole>();
  const patchRequest = usePatchRequest<Partial<EdaRole>, EdaRole>();

  const onSubmit: PageFormSubmitHandler<EdaRole> = async (Role) => {
    if (Number.isInteger(id)) {
      Role = await patchRequest(`${API_PREFIX}/roles/${id}/`, Role);
      navigate(-1);
    } else {
      const newRole = await postRequest(`${API_PREFIX}/roles/`, Role);
      navigate(RouteObj.EdaRoleDetails.replace(':id', newRole.id.toString()));
    }
  };
  const onCancel = () => navigate(-1);

  if (Number.isInteger(id)) {
    if (!Role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: t('Edit Role') }]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Role')}
            breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: t('Edit Role') }]}
          />
          <PageForm<EdaRole>
            submitText={t('Save role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Role}
          >
            <PageFormTextInput<EdaRole> name="name" label={t('Name')} isRequired />
            <PageFormTextInput<EdaRole> name="description" label={t('Description')} />
          </PageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Role')}
          breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: t('Create Role') }]}
        />
        <PageForm<EdaRole>
          submitText={t('Create role')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormTextInput<EdaRole> name="name" label={t('Name')} isRequired />
          <PageFormTextInput<EdaRole> name="description" label={t('Description')} />
        </PageForm>
      </PageLayout>
    );
  }
}
