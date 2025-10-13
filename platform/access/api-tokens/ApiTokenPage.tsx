import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { PlatformUser } from '../../interfaces/PlatformUser';
import { Token } from '../../interfaces/Token';
import { PlatformRoute } from '../../main/PlatformRoutes';
import { gatewayAPI } from '../../utils/gateway-api-utils';
import { ApiTokenDetails } from './ApiTokenDetails';
import { useApiTokenRowActions } from './hooks/useApiTokenRowActions';

export function ApiTokenPage() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { id: userId, tokenid } = useParams<{ id?: string; tokenid: string }>();
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(gatewayAPI`/tokens/`, tokenid);
  const navigate = useNavigate();
  const itemActions = useApiTokenRowActions(() => void navigate(-1));
  const { data: user } = useGet<PlatformUser>(userId ? gatewayAPI`/users/${userId}/` : undefined);
  if (tokenError) return <AwxError error={tokenError} handleRefresh={refreshToken} />;
  if (!token) return <LoadingState />;
  const title =
    token.description || token.summary_fields?.application?.name || t('Personal access token');
  return (
    <PageLayout>
      <PageHeader
        title={title}
        breadcrumbs={
          user !== undefined
            ? [
                { label: t('Users'), to: getPageUrl(PlatformRoute.Users) },
                {
                  label: user?.username,
                  to: getPageUrl(PlatformRoute.UserDetails, { params: { id: userId } }),
                },
                { label: title },
              ]
            : [
                { label: t('API Tokens'), to: getPageUrl(PlatformRoute.ApiTokens) },
                { label: title },
              ]
        }
        headerActions={
          <PageActions<Token> actions={itemActions} position="right" selectedItem={token} />
        }
      />
      <ApiTokenDetails />
    </PageLayout>
  );
}
