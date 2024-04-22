import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageFormSubmitHandler,
  PageFormTextInput,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { EdaPageForm } from '../../common/EdaPageForm';
import { edaAPI } from '../../common/eda-utils';
import { useEdaActiveUser } from '../../common/useEdaActiveUser';
import { EdaControllerToken, EdaControllerTokenCreate } from '../../interfaces/EdaControllerToken';
import { EdaRoute } from '../../main/EdaRoutes';

function ControllerTokenInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormTextInput<EdaControllerTokenCreate>
        name="name"
        label={t('Name')}
        placeholder={t('Enter name')}
        isRequired
        maxLength={150}
      />
      <PageFormTextInput<EdaControllerTokenCreate>
        name="description"
        label={t('Description')}
        placeholder={t('Enter description ')}
        maxLength={150}
      />
      <PageFormTextInput<EdaControllerTokenCreate>
        name="token"
        label={t('Token')}
        isRequired
        maxLength={150}
        placeholder={t('Enter controller token')}
      />
    </>
  );
}

export function CreateControllerToken() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<EdaControllerTokenCreate, EdaControllerToken>();
  const { activeEdaUser } = useEdaActiveUser();

  const onSubmit: PageFormSubmitHandler<EdaControllerTokenCreate> = async (token) => {
    await postRequest(edaAPI`/users/me/awx-tokens/`, token);
    pageNavigate(EdaRoute.MyTokens);
  };
  const onCancel = () => navigate(-1);

  const getPageUrl = useGetPageUrl();

  const canViewUsers = activeEdaUser?.is_superuser;
  const breadcrumbs = [
    ...(canViewUsers ? [{ label: t('Users'), to: getPageUrl(EdaRoute.Users) }] : []),
    {
      label: activeEdaUser?.username ?? '',
      to: canViewUsers
        ? getPageUrl(EdaRoute.UserPage, { params: { id: activeEdaUser?.id } })
        : getPageUrl(EdaRoute.MyPage),
    },
    {
      label: t('Controller tokens'),
      to: canViewUsers
        ? getPageUrl(EdaRoute.UserTokens, { params: { id: activeEdaUser?.id } })
        : getPageUrl(EdaRoute.MyTokens),
    },
    { label: activeEdaUser?.username ?? '' },
  ];

  return (
    <PageLayout>
      <PageHeader title={t('Create Controller Token')} breadcrumbs={breadcrumbs} />
      <EdaPageForm
        submitText={t('Create controller token')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ControllerTokenInputs />
      </EdaPageForm>
    </PageLayout>
  );
}
