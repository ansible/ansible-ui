import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageFormSelect,
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
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaContentTypes, useEdaRoleMetadata } from './hooks/useEdaRoleMetadata';
import { PageFormMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { useWatch } from 'react-hook-form';

export function CreateRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaRbacRole>, EdaRbacRole>();

  const onSubmit: PageFormSubmitHandler<EdaRbacRole> = async (Role) => {
    const newRole = await postRequest(edaAPI`/role_definitions/`, Role);
    pageNavigate(EdaRoute.RolePage, { params: { id: newRole.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Role')}
        breadcrumbs={[
          { label: t('Roles'), to: getPageUrl(EdaRoute.Roles) },
          { label: t('Create Role') },
        ]}
      />
      <EdaPageForm<EdaRbacRole>
        submitText={t('Create role')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <EdaRoleInputs />
      </EdaPageForm>
    </PageLayout>
  );
}

export function EditRole() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: Role } = useGet<EdaRbacRole>(edaAPI`/role_definitions/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaRbacRole>, EdaRbacRole>();
  const patchRequest = usePatchRequest<Partial<EdaRbacRole>, EdaRbacRole>();

  const onSubmit: PageFormSubmitHandler<EdaRbacRole> = async (Role) => {
    if (Number.isInteger(id)) {
      Role = await patchRequest(edaAPI`/role_definitions/${id.toString()}/`, Role);
      navigate(-1);
    } else {
      const newRole = await postRequest(edaAPI`/role_definitions/`, Role);
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
          <EdaPageForm<EdaRbacRole>
            submitText={t('Save role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={Role}
          >
            <EdaRoleInputs disableContentType />
          </EdaPageForm>
        </PageLayout>
      );
    }
  }
}

function EdaRoleInputs(props: { disableContentType?: boolean }) {
  const { t } = useTranslation();
  const { disableContentType } = props;
  const edaRoleMetadata = useEdaRoleMetadata();
  const content_type = useWatch<EdaRbacRole>({ name: 'content_type' });
  return (
    <>
      <PageFormTextInput<EdaRbacRole> name="name" label={t('Name')} isRequired />
      <PageFormTextInput<EdaRbacRole> name="description" label={t('Description')} />
      <PageFormSelect
        name={'content_type'}
        label={t('Content Type')}
        placeholderText={t('Select a content type')}
        options={Object.entries(edaRoleMetadata.content_types)
          .filter(
            ([option]) =>
              option.startsWith('eda.') &&
              !['extravar', 'auditrule', 'rulebookprocess', 'rulebook'].some(function (v) {
                return option.endsWith(v);
              })
          )
          .map(([key, value]) => ({
            label: value?.displayName,
            value: key,
          }))}
        isDisabled={disableContentType}
        isRequired
      />
      <PageFormHidden watch="content_type" hidden={(content_type: string) => !content_type}>
        <PageFormMultiSelect
          name="permissions"
          label={t('Permissions')}
          options={Object.entries(
            edaRoleMetadata.content_types[content_type as EdaContentTypes]?.permissions || {}
          ).map(([key, value]) => ({
            label: value,
            value: key,
          }))}
          placeholder={t('Select permissions')}
          isRequired
        />
      </PageFormHidden>
    </>
  );
}
