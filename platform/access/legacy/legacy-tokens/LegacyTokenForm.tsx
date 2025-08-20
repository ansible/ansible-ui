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
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { usePostRequest } from '@ansible/common-ui/crud/usePostRequest';
import { usePutRequest } from '@ansible/common-ui/crud/usePutRequest';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { LegacyApplicationSelect } from '../legacy-applications/components/LegacyApplicationSelect';

export function LegacyTokenForm() {
  const { id: userId, tokenid } = useParams<{ id?: string; tokenid?: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const navigate = useNavigate();
  const onCancel = () => void navigate(-1);
  const { data: user } = useGet<AwxUser>(userId ? awxAPI`/users/${userId}/` : undefined);
  const { data: token } = useGet<Token>(tokenid ? awxAPI`/tokens/${tokenid}/` : undefined);

  const title = useMemo(() => {
    if (token) {
      return t('Edit {{token}}', {
        token:
          token.description ?? token.summary_fields.application.name ?? t('Personal Access Token'),
      });
    } else {
      return t('Create Legacy Token');
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
          label: t('Legacy Tokens'),
          to: getPageUrl(PlatformRoute.UserLegacyTokens, { params: { id: user.id } }),
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
        { label: t('Legacy Tokens'), to: getPageUrl(PlatformRoute.LegacyTokens) },
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
        const updatedToken = await putRequest(awxAPI`/tokens/${token.id}/`, tokenInput);
        if (userId !== undefined) {
          pageNavigate(PlatformRoute.UserLegacyTokenDetails, {
            params: { id: userId, tokenid: updatedToken.id },
          });
        } else {
          pageNavigate(PlatformRoute.LegacyTokenPage, {
            params: { tokenid: updatedToken.id },
          });
        }
      } else {
        const newToken = await postRequest(awxAPI`/tokens/`, tokenInput);
        if (userId !== undefined) {
          pageNavigate(PlatformRoute.UserLegacyTokenDetails, {
            params: { id: userId, tokenid: newToken.id },
          });
        } else {
          pageNavigate(PlatformRoute.LegacyTokenPage, {
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
        <LegacyApplicationSelect<Token>
          name="application"
          isRequired={false}
          isDisabled={tokenid}
        />
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
