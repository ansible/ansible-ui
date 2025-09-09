import {
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { PageFormSection } from '@ansible/ansible-ui-framework/PageForm/Utils/PageFormSection';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePatchRequest } from '@ansible/common-ui/crud/usePatchRequest';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { useInvalidateCacheOnUnmount } from '@ansible/common-ui/useInvalidateCache/useInvalidateCache';
import { PlatformRoute } from '@ansible/platform-ui/main/PlatformRoutes';
import { HelperText, HelperTextItem } from '@patternfly/react-core';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PageFormHidden } from '../../../framework/PageForm/Utils/PageFormHidden';
import { PlatformRole } from '../../interfaces/PlatformRole';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { PageFormRolePermissionsSelect } from './components/PageFormPermissionsSelect';
import { PageFormRoleTypeSelect } from './components/PageFormRoleTypeSelect';
import { ContentTypeEnum } from '@ansible/hub-ui/interfaces/expanded/ContentType';

export function CreatePlatformRole(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();

  useInvalidateCacheOnUnmount();

  const postRequest = usePostRequest<Partial<PlatformRole>, PlatformRole>();

  const onSubmit: PageFormSubmitHandler<PlatformRole> = async (role) => {
    const toCreateRole: PlatformRole = {
      ...role,
      content_type: role.content_type === ContentTypeEnum.System ? null : role.content_type,
    };
    const newRole = await postRequest(gatewayAPI`/role_definitions/`, toCreateRole);
    pageNavigate(PlatformRoute.RoleDetails, { params: { id: newRole.id } });
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
            to: getPageUrl(PlatformRoute.Roles),
          },
          { label: t('Create role') },
        ]}
      />
      <PageForm<PlatformRole>
        submitText={t('Create role')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <PlatformRoleInputs isEditMode={false} />
      </PageForm>
    </PageLayout>
  );
}

export function EditPlatformRole(props: { breadcrumbLabelForPreviousPage?: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);

  const { data: role } = useGet<PlatformRole>(gatewayAPI`/role_definitions/${id.toString()}/`);

  useInvalidateCacheOnUnmount();

  const patchRequest = usePatchRequest<Partial<PlatformRole>, PlatformRole>();

  const onSubmit: PageFormSubmitHandler<PlatformRole> = async (data) => {
    await patchRequest(gatewayAPI`/role_definitions/${id.toString()}/`, data);
    pageNavigate(PlatformRoute.RoleDetails, { params: { id } });
  };
  const onCancel = () => void navigate(-1);
  const getPageUrl = useGetPageUrl();

  if (id) {
    if (!role) {
      return (
        <PageLayout>
          <PageHeader
            breadcrumbs={[
              {
                label: props.breadcrumbLabelForPreviousPage || t('Roles'),
                to: getPageUrl(PlatformRoute.Roles),
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
              { label: t('Roles'), to: getPageUrl(PlatformRoute.Roles) },
              { label: role?.name ? t('Edit {{roleName}}', { roleName: role?.name }) : t('Roles') },
            ]}
          />
          <PageForm<PlatformRole>
            submitText={t('Save role')}
            onSubmit={onSubmit}
            cancelText={t('Cancel')}
            defaultValue={{
              ...role,
              content_type:
                role?.content_type === null ? ContentTypeEnum.System : role?.content_type,
            }}
            onCancel={onCancel}
          >
            <PlatformRoleInputs isEditMode={true} />
          </PageForm>
        </PageLayout>
      );
    }
  }
}

function PlatformRoleInputs({ isEditMode = false }: { isEditMode?: boolean }) {
  const { t } = useTranslation();
  const { setValue, getFieldState } = useFormContext();
  const contentType = useWatch({
    name: 'content_type',
  }) as string;

  useEffect(() => {
    const { isDirty } = getFieldState('content_type');
    if (isDirty) {
      setValue('permissions', undefined);
    }
  }, [getFieldState, contentType, setValue]);

  return (
    <>
      <PageFormSection title={t('Details')}>
        <PageFormTextInput<PlatformRole>
          name="name"
          label={t('Name')}
          placeholder={t('Enter role name')}
          isRequired
        />
        <PageFormTextInput<PlatformRole>
          name="description"
          label={t('Description')}
          placeholder={t('Enter description')}
          isRequired
        />
      </PageFormSection>
      <PageFormSection title={t('Permissions')}>
        <PageFormSection singleColumn>
          <HelperText>
            <HelperTextItem>
              {t(
                'Select a resource type and permissions. Teams and users assigned this role will have these permissions for specific resources.'
              )}
            </HelperTextItem>
          </HelperText>
        </PageFormSection>
        <PageFormSection>
          <PageFormRoleTypeSelect
            name={'content_type'}
            isRequired
            isDisabled={isEditMode ? t('The resource type cannot be edited.') : undefined}
          />
          <PageFormHidden watch="content_type" hidden={(content_type: string) => !content_type}>
            <PageFormRolePermissionsSelect
              name={'permissions'}
              isRequired
              contentType={contentType}
            />
          </PageFormHidden>
        </PageFormSection>
      </PageFormSection>
    </>
  );
}
