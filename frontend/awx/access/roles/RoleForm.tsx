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
import { AwxPageForm } from '../../common/AwxPageForm';
import { awxAPI } from '../../common/api/awx-utils';
import { AwxRbacRole } from '../../interfaces/AwxRbacRole';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxContentTypes, useAwxRoleMetadata } from './hooks/useAwxRoleMetadata';
import { PageFormMultiSelect } from '../../../../framework/PageForm/Inputs/PageFormMultiSelect';
import { PageFormHidden } from '../../../../framework/PageForm/Utils/PageFormHidden';
import { useWatch } from 'react-hook-form';

export function CreateRole(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<AwxRbacRole>, AwxRbacRole>();

  const onSubmit: PageFormSubmitHandler<AwxRbacRole> = async (Role) => {
    const newRole = await postRequest(awxAPI`/role_definitions/`, Role);
    pageNavigate(AwxRoute.RoleDetails, { params: { id: newRole.id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={t('Create role')}
        breadcrumbs={[
          {
            label: props.breadcrumbLabelForPreviousPage || t('Roles'),
            to: getPageUrl(AwxRoute.Roles),
          },
          { label: t('Create role') },
        ]}
      />
      <AwxPageForm<AwxRbacRole>
        submitText={t('Create role')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <AwxRoleInputs />
      </AwxPageForm>
    </PageLayout>
  );
}

export function EditRole(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: role } = useGet<AwxRbacRole>(awxAPI`/role_definitions/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const patchRequest = usePatchRequest<Partial<AwxRbacRole>, AwxRbacRole>();

  const onSubmit: PageFormSubmitHandler<AwxRbacRole> = async (data) => {
    await patchRequest(awxAPI`/role_definitions/${id.toString()}/`, data);
    pageNavigate(AwxRoute.RoleDetails, { params: { id } });
  };
  const onCancel = () => navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (Number.isInteger(id)) {
    if (!role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              {
                label: props.breadcrumbLabelForPreviousPage || t('Roles'),
                to: getPageUrl(AwxRoute.Roles),
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
            title={role?.name ? t('Edit {{roleName}}', { roleName: role?.name }) : t('Roles')}
            breadcrumbs={[
              { label: t('Roles'), to: getPageUrl(AwxRoute.Roles) },
              { label: role?.name ? t('Edit {{roleName}}', { roleName: role?.name }) : t('Roles') },
            ]}
          />
          <AwxPageForm<AwxRbacRole>
            submitText={t('Save role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            onCancel={onCancel}
            defaultValue={role}
          >
            <AwxRoleInputs disableContentType />
          </AwxPageForm>
        </PageLayout>
      );
    }
  }
}

function AwxRoleInputs(props: { disableContentType?: boolean }) {
  const { t } = useTranslation();
  const { disableContentType } = props;
  const awxRoleMetadata = useAwxRoleMetadata();
  const content_type = useWatch<AwxRbacRole>({ name: 'content_type' });
  return (
    <>
      <PageFormTextInput<AwxRbacRole> name="name" label={t('Name')} isRequired />
      <PageFormTextInput<AwxRbacRole> name="description" label={t('Description')} />
      <PageFormSelect
        name={'content_type'}
        label={t('Content Type')}
        placeholderText={t('Select a content type')}
        options={Object.entries(awxRoleMetadata.content_types)
          .filter(([option]) => option !== 'shared.team')
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
            awxRoleMetadata.content_types[content_type as AwxContentTypes]?.permissions || {}
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
