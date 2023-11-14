import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
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
import { edaAPI } from '../../api/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';
import { EdaPageForm } from '../../EdaPageForm';

export function EditRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Role } = useGet<EdaRole>(edaAPI`/roles/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaRole>, EdaRole>();
  const patchRequest = usePatchRequest<Partial<EdaRole>, EdaRole>();

  const onSubmit: PageFormSubmitHandler<EdaRole> = async (Role) => {
    if (Number.isInteger(id)) {
      Role = await patchRequest(edaAPI`/roles/${id.toString()}/`, Role);
      navigate(-1);
    } else {
      const newRole = await postRequest(edaAPI`/roles/`, Role);
      pageNavigate(EdaRoute.RolePage, { params: { id: newRole.id } });
    }
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (Number.isInteger(id)) {
    if (!Role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              { label: t('Roles'), to: getPageUrl(EdaRoute.Roles) },
              { label: t('Edit Role') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={t('Edit Role')}
            breadcrumbs={[
              { label: t('Roles'), to: getPageUrl(EdaRoute.Roles) },
              { label: t('Edit Role') },
            ]}
          />
          <EdaPageForm<EdaRole>
            submitText={t('Save role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Role}
          >
            <PageFormTextInput<EdaRole> name="name" label={t('Name')} isRequired />
            <PageFormTextInput<EdaRole> name="description" label={t('Description')} />
          </EdaPageForm>
        </PageLayout>
      );
    }
  } else {
    return (
      <PageLayout>
        <PageHeader
          title={t('Create Role')}
          breadcrumbs={[
            { label: t('Roles'), to: getPageUrl(EdaRoute.Roles) },
            { label: t('Create Role') },
          ]}
        />
        <EdaPageForm<EdaRole>
          submitText={t('Create role')}
          onSubmit={onSubmit}
          cancelText={t('Cancel')}
          onCancel={onCancel}
        >
          <PageFormTextInput<EdaRole> name="name" label={t('Name')} isRequired />
          <PageFormTextInput<EdaRole> name="description" label={t('Description')} />
        </EdaPageForm>
      </PageLayout>
    );
  }
}
