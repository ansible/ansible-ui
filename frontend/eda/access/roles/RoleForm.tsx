import {
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormMultiSelect } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormHidden } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormHidden';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { EdaRbacRole } from '../../interfaces/EdaRbacRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { EdaContentType } from './hooks/EdaContentType';
import { useEdaRoleMetadata } from './hooks/useEdaRoleMetadata';

export function CreateRole(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<EdaRbacRole>, EdaRbacRole>();

  const onSubmit: PageFormSubmitHandler<EdaRbacRole> = async (Role) => {
    const newRole = await postRequest(edaAPI`/role_definitions/`, Role);
    pageNavigate(EdaRoute.RolePage, { params: { id: newRole.id } });
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create role')}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(EdaRoute.Roles),
          },
          { label: t('Create role') },
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

export function EditRole(props: { breadcrumbLabelForPreviousPage?: string }) {
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
      void navigate(-1);
    } else {
      const newRole = await postRequest(edaAPI`/role_definitions/`, Role);
      pageNavigate(EdaRoute.RolePage, { params: { id: newRole.id } });
    }
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (Number.isInteger(id)) {
    if (!Role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              {
                label: props.breadcrumbLabelForPreviousPage || t('Roles'),
                to: getPageUrl(EdaRoute.Roles),
              },
              { label: t('Edit Role') },
            ]}
          />
        </PageLayout>
      );
    } else {
      return (
        <PageLayout>
          <PageHeader
            title={Role?.name ? `${t('Edit')} ${Role?.name}` : t('Role')}
            breadcrumbs={[
              { label: t('Roles'), to: getPageUrl(EdaRoute.Roles) },
              { label: Role?.name ? `${t('Edit')} ${Role?.name}` : t('Role') },
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
      <PageFormTextInput<EdaRbacRole>
        name="name"
        label={t('Name')}
        placeholder={t('Enter role name')}
        isRequired
      />
      <PageFormTextArea<EdaRbacRole>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description')}
      />
      <PageFormSelect
        name={'content_type'}
        label={t('Content Type')}
        placeholderText={t('Select content type')}
        options={Object.entries(edaRoleMetadata.content_types)
          .filter(
            ([option]) =>
              ![
                'shared.team',
                'eda.extravar',
                'eda.auditrule',
                'eda.rulebookprocess',
                'eda.rulebook',
              ].includes(option)
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
            edaRoleMetadata.content_types[content_type as EdaContentType]?.permissions || {}
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
