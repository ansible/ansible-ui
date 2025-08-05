import { PageActions, PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { AwxError } from '@ansible/awx-ui/common/AwxError';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Token } from '@ansible/awx-ui/interfaces/Token';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { LegacyTokenDetails } from './LegacyTokenDetails';
import { useLegacyTokenRowActions } from './hooks/useLegacyTokenRowActions';

export function LegacyTokenPage() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const { id: userId, tokenid } = useParams<{ id?: string; tokenid: string }>();
  const {
    error: tokenError,
    data: token,
    refresh: refreshToken,
  } = useGetItem<Token>(awxAPI`/tokens/`, tokenid);
  const navigate = useNavigate();
  const itemActions = useLegacyTokenRowActions(() => void navigate(-1));
  const { data: user } = useGet<AwxUser>(userId ? awxAPI`/users/${userId}/` : undefined);
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
                {
                  label: t('Legacy Tokens'),
                  to: getPageUrl(PlatformRoute.UserLegacyTokens, {
                    params: { id: userId, tokenid: tokenid },
                  }),
                },
                {
                  label: user?.username,
                  to: getPageUrl(PlatformRoute.UserDetails, { params: { id: userId } }),
                },
                {
                  label: t('Legacy Tokens'),
                  to: getPageUrl(PlatformRoute.UserLegacyTokens, { params: { id: userId } }),
                },
                { label: title },
              ]
            : [
                { label: t('Legacy Tokens'), to: getPageUrl(PlatformRoute.LegacyTokens) },
                { label: title },
              ]
        }
        headerActions={
          <PageActions<Token> actions={itemActions} position="right" selectedItem={token} />
        }
      />
      <LegacyTokenDetails />
    </PageLayout>
  );
}
