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

function ControllerTokenInputs(props: { tokenPlaceHolder?: string }) {
  const { t } = useTranslation();
  const { tokenPlaceHolder } = props;
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
        placeholder={tokenPlaceHolder ?? t('Enter controller token')}
      />
    </>
  );
}

export function CreateControllerToken(props: {
  breadCrumbTitle?: string;
  pageTitle?: string;
  tokenPlaceHolder?: string;
  submitText?: string;
}) {
  const { breadCrumbTitle, pageTitle, tokenPlaceHolder, submitText } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const pageNavigate = usePageNavigate();
  const postRequest = usePostRequest<EdaControllerTokenCreate, EdaControllerToken>();
  const { activeEdaUser } = useEdaActiveUser();

  const onSubmit: PageFormSubmitHandler<EdaControllerTokenCreate> = async (token) => {
    await postRequest(edaAPI`/users/me/awx-tokens/`, token);
    pageNavigate(EdaRoute.MyTokens, { params: { id: activeEdaUser?.id } });
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
        : getPageUrl(EdaRoute.MyPage, { params: { id: activeEdaUser?.id } }),
    },
    {
      label: breadCrumbTitle ?? t('Controller tokens'),
      to: canViewUsers
        ? getPageUrl(EdaRoute.UserTokens, { params: { id: activeEdaUser?.id } })
        : getPageUrl(EdaRoute.MyTokens, { params: { id: activeEdaUser?.id } }),
    },
    { label: activeEdaUser?.username ?? '' },
  ];

  return (
    <PageLayout>
      <PageHeader title={pageTitle ?? t('Create Controller Token')} breadcrumbs={breadcrumbs} />
      <EdaPageForm
        submitText={submitText ?? t('Create controller token')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <ControllerTokenInputs tokenPlaceHolder={tokenPlaceHolder} />
      </EdaPageForm>
    </PageLayout>
  );
}
