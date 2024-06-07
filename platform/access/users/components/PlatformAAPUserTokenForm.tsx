import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LoadingPage,
  PageFormSelect,
  PageFormSubmitHandler,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { usePlatformActiveUser } from '../../../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { Token } from '../../../../frontend/awx/interfaces/Token';
import { PageForm } from '../../../../framework';
import { PageFormTextInput } from '../../../../framework';
import { usePostRequest } from '../../../../frontend/common/crud/usePostRequest';
import { gatewayAPI } from '../../../api/gateway-api-utils';
import { PageFormApplicationSelect } from '../../applications/components/PageFormApplicationSelect';

export function CreateAAPUserToken(props: { onSuccessfulCreate: (newToken: Token) => void }) {
  const params = useParams<{ id: string }>();
  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeUser === undefined || activeUser?.id.toString() !== params.id) {
      // redirect to user details for the active/logged-in user
      pageNavigate(PlatformRoute.UserDetails, { params: { id: activeUser?.id } });
    }
  }, [activeUser, params.id, pageNavigate]);

  if (!activeUser) return <LoadingPage breadcrumbs tabs />;

  return activeUser?.id.toString() === params.id ? (
    <CreateAAPUserTokenInternal user={activeUser} onCreate={props.onSuccessfulCreate} />
  ) : (
    <></>
  );
}

function CreateAAPUserTokenInternal(props: {
  user: PlatformUser;
  onCreate: (newToken: Token) => void;
}) {
  const { user } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Token, Token>();
  const pageNavigate = usePageNavigate();

  const onCancel = () => navigate(-1);
  const onSubmit: PageFormSubmitHandler<Token> = async (tokenInput) => {
    const newToken = await postRequest(gatewayAPI`/tokens/`, tokenInput);
    props.onCreate(newToken);
    pageNavigate(PlatformRoute.AAPUserTokenDetails, {
      params: { id: user.id, tokenid: newToken.id },
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Token')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
          {
            label: user.username,
            to: getPageUrl(PlatformRoute.UserDetails, { params: { id: user.id } }),
          },
          {
            label: t('Tokens'),
            to: getPageUrl(PlatformRoute.UserTokens, { params: { id: user.id } }),
          },
        ]}
      />
      <PageForm<Token>
        submitText={t('Create token')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <UserTokenFormInputs />
      </PageForm>
    </PageLayout>
  );
}

function UserTokenFormInputs() {
  const { t } = useTranslation();
  return (
    <>
      <PageFormApplicationSelect name="application" isRequired={false} />
      <PageFormTextInput<Token>
        name="description"
        label={t('Description')}
        placeholder={t('Enter token description')}
        isRequired={false}
      />
      <PageFormSelect<Token>
        name="scope"
        label={t('Scope')}
        placeholderText={t('Select a scope')}
        options={[
          {
            label: t('Read'),
            value: 'read',
          },
          {
            label: t('Write'),
            value: 'write',
          },
        ]}
        isRequired
      />
    </>
  );
}
