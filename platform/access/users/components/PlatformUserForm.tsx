import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageForm,
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../../frontend/common/crud/useGet';
import { usePatchRequest } from '../../../../frontend/common/crud/usePatchRequest';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { PlatformRoute } from '../../../PlatformRoutes';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PlatformUser } from '../../../interfaces/PlatformUser';

export function CreatePlatformUser() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const navigate = useNavigate();
  const postRequest = usePostRequest<PlatformUser>();
  const onSubmit: PageFormSubmitHandler<PlatformUser> = async (user) => {
    const createdUser = await postRequest(gatewayAPI`/v1/users/`, user);
    pageNavigate(PlatformRoute.UserDetails, { params: { id: createdUser.id } });
  };
  const getPageUrl = useGetPageUrl();
  return (
    <PageLayout>
      <PageHeader
        title={t('Create user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Create user') },
        ]}
      />
      <PageForm
        submitText={t('Create user')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={() => navigate(-1)}
      >
        <PlatformUserInputs isCreate />
      </PageForm>
    </PageLayout>
  );
}

export function EditPlatformUser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const id = Number(params.id);
  const { data: user, isLoading } = useGet<PlatformUser>(gatewayAPI`/v1/users/${id.toString()}/`);
  const patchRequest = usePatchRequest<PlatformUser, PlatformUser>();
  const onSubmit: PageFormSubmitHandler<PlatformUser> = async (user) => {
    await patchRequest(gatewayAPI`/v1/users/${id.toString()}/`, user);
    navigate(-1);
  };
  const getPageUrl = useGetPageUrl();
  if (isLoading) return <LoadingPage breadcrumbs />;
  return (
    <PageLayout>
      <PageHeader
        title={t('Edit user')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          { label: t('Edit user') },
        ]}
      />
      <PageForm
        submitText={t('Save user')}
        onSubmit={onSubmit}
        onCancel={() => navigate(-1)}
        defaultValue={user}
      >
        <PlatformUserInputs />
      </PageForm>
    </PageLayout>
  );
}

function PlatformUserInputs(props: { isCreate?: boolean }) {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<PlatformUser>
        name="username"
        label={t('Username')}
        placeholder={t('Enter username')}
        isRequired
      />
      <PageFormTextInput<PlatformUser>
        name="password"
        label={t('Password')}
        placeholder={t('Enter password')}
        type="password"
        isRequired={props.isCreate}
      />
      <PageFormTextInput<PlatformUser>
        name="first_name"
        label={t('First name')}
        placeholder={t('Enter first name')}
      />
      <PageFormTextInput<PlatformUser>
        name="last_name"
        label={t('Last name')}
        placeholder={t('Enter last name')}
      />
      <PageFormTextInput<PlatformUser>
        name="email"
        label={t('EMail')}
        placeholder={t('Enter email')}
      />
    </>
  );
}
