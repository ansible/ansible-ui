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
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { AwxRoute } from '../../main/AwxRoutes';
import { AwxUser } from '../../interfaces/User';
import { Token } from '../../interfaces/Token';
import { AwxPageForm } from '../../common/AwxPageForm';
import { PageFormTextInput } from '../../../../framework';
import { usePostRequest } from '../../../common/crud/usePostRequest';
import { awxAPI } from '../../common/api/awx-utils';
import { PageFormApplicationSelect } from '../../administration/applications/components/PageFormApplicationSelect';

export function CreateUserToken(props: { onSuccessfulCreate: (newToken: Token) => void }) {
  const params = useParams<{ id: string }>();
  const { activeAwxUser } = useAwxActiveUser();
  const pageNavigate = usePageNavigate();

  useEffect(() => {
    if (activeAwxUser === undefined || activeAwxUser?.id.toString() !== params.id) {
      // redirect to user details for the active/logged-in user
      pageNavigate(AwxRoute.UserDetails, { params: { id: activeAwxUser?.id } });
    }
  }, [activeAwxUser, params.id, pageNavigate]);

  if (!activeAwxUser) return <LoadingPage breadcrumbs tabs />;

  return activeAwxUser?.id.toString() === params.id ? (
    <CreateUserTokenInternal user={activeAwxUser} onCreate={props.onSuccessfulCreate} />
  ) : (
    <></>
  );
}

function CreateUserTokenInternal(props: { user: AwxUser; onCreate: (newToken: Token) => void }) {
  const { user } = props;
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const postRequest = usePostRequest<Token, Token>();
  const pageNavigate = usePageNavigate();

  const onCancel = () => navigate(-1);
  const onSubmit: PageFormSubmitHandler<Token> = async (tokenInput) => {
    const newToken = await postRequest(awxAPI`/tokens/`, tokenInput);
    props.onCreate(newToken);
    pageNavigate(AwxRoute.UserTokenDetails, { params: { id: user.id, tokenid: newToken.id } });
  };

  return (
    <PageLayout>
      <PageHeader
        title={t('Create Token')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
          {
            label: user.username,
            to: getPageUrl(AwxRoute.UserDetails, { params: { id: user.id } }),
          },
          {
            label: t('Tokens'),
            to: getPageUrl(AwxRoute.UserTokens, { params: { id: user.id } }),
          },
        ]}
      />
      <AwxPageForm
        submitText={t('Create token')}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
      >
        <UserTokenFormInputs />
      </AwxPageForm>
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
