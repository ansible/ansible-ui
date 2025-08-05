import {
  ICatalogBreadcrumb,
  PageForm,
  PageFormSelect,
  PageFormSubmitHandler,
  PageFormTextArea,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageDialogs,
  usePageNavigate,
} from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { UserTokenSecretsModal } from '@ansible/awx-ui/access/users/UserPage/UserTokenSecretsModal';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { usePutRequest } from '@ansible/common-ui/crud/usePutRequest';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { Token } from '../../interfaces/Token';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { OAuthApplicationSelect } from '../oauth-applications/components/OAuthApplicationSelect';

export function ApiTokenForm() {
  const { id: userId, tokenid } = useParams<{ id?: string; tokenid?: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const onCancel = () => void navigate(-1);
  const { data: user } = useGet<PlatformUser>(userId ? gatewayAPI`/users/${userId}/` : undefined);
  const { data: token } = useGet<Token>(tokenid ? gatewayAPI`/tokens/${tokenid}/` : undefined);

  const title = useMemo(() => {
    if (token) {
      return t('Edit {{token}}', {
        token:
          token.description ?? token.summary_fields.application.name ?? t('Personal Access Token'),
      });
    } else {
      return t('Create API Token');
    }
  }, [t, token]);

  const breadcrumbs = useMemo<ICatalogBreadcrumb[]>(() => {
    if (user) {
      // This is the tokens under a user
      return [
        { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
        {
          label: user?.username,
          to: getPageUrl(PlatformRoute.UserDetails, { params: { id: user.id } }),
        },
        {
          label: t('API Tokens'),
          to: getPageUrl(PlatformRoute.UserApiTokens, { params: { id: user.id } }),
        },
        {
          label: token
            ? (token.description ??
              token.summary_fields.application.name ??
              t('Personal Access Token'))
            : t('Create token'),
        },
      ];
    } else {
      // this is the global tokens
      return [
        { label: t('API Tokens'), to: getPageUrl(PlatformRoute.ApiTokens) },
        {
          label: token
            ? (token.description ??
              token.summary_fields.application.name ??
              t('Personal Access Token'))
            : t('Create token'),
        },
      ];
    }
  }, [getPageUrl, t, token, user]);

  const submitText = useMemo(() => {
    if (tokenid !== undefined) {
      return t('Update token');
    } else {
      return t('Create token');
    }
  }, [t, tokenid]);

  const postRequest = usePostRequest<Token, Token>();
  const putRequest = usePutRequest<Token, Token>();
  const pageNavigate = usePageNavigate();
  const { pushDialog, popDialog } = usePageDialogs();
  const onSubmit: PageFormSubmitHandler<Token> = useCallback(
    async (tokenInput) => {
      if (token) {
        const updatedToken = await putRequest(gatewayAPI`/tokens/${token.id}/`, tokenInput);
        if (userId !== undefined) {
          pageNavigate(PlatformRoute.UserApiTokenDetails, {
            params: { id: userId, tokenid: updatedToken.id },
          });
        } else {
          pageNavigate(PlatformRoute.ApiTokenPage, {
            params: { tokenid: updatedToken.id },
          });
        }
      } else {
        const newToken = await postRequest(gatewayAPI`/tokens/`, tokenInput);
        if (userId !== undefined) {
          pageNavigate(PlatformRoute.UserApiTokenDetails, {
            params: { id: userId, tokenid: newToken.id },
          });
        } else {
          pageNavigate(PlatformRoute.ApiTokenPage, {
            params: { tokenid: newToken.id },
          });
          setTimeout(() => {
            pushDialog(<UserTokenSecretsModal onClose={() => popDialog()} newToken={newToken} />);
          }, 300);
        }
      }
    },
    [token, putRequest, userId, pageNavigate, postRequest, pushDialog, popDialog]
  );

  if (userId && !user) return <LoadingState />;
  if (tokenid && !token) return <LoadingState />;

  return (
    <PageLayout>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      <PageForm<Token>
        submitText={submitText}
        onSubmit={onSubmit}
        cancelText={t('Cancel')}
        onCancel={onCancel}
        defaultValue={token}
      >
        <PageFormTextArea<Token>
          name="description"
          label={t('Description')}
          placeholder={t('Enter token description')}
          isRequired={false}
          autoFocus
        />
        <OAuthApplicationSelect<Token> name="application" isRequired={false} isDisabled={tokenid} />
        <PageFormSelect<Token>
          name="scope"
          label={t('Scope')}
          placeholderText={t('Select scope')}
          options={[
            { label: t('Read'), value: 'read' },
            { label: t('Write'), value: 'write' },
          ]}
          isRequired
          defaultValue="write"
        />
      </PageForm>
    </PageLayout>
  );
}
