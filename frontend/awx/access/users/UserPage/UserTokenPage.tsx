import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetPageUrl } from '../../../../../framework';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxUser } from '../../../interfaces/User';
import { awxAPI } from '../../../common/api/awx-utils';
import { AwxError } from '../../../common/AwxError';

export function UserTokenPage() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; tokenid: string }>();
  const { error, data: user, refresh } = useGetItem<AwxUser>(awxAPI`/users`, params.id);

  if (error) return <AwxError error={error} handleRefresh={refresh} />;

  return (
    <PageLayout>
      <PageHeader
        title={t('Token')}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
          {
            label: user?.username,
            to: getPageUrl(AwxRoute.UserDetails, { params: { id: params.id } }),
          },
          {
            label: t('Tokens'),
            to: getPageUrl(AwxRoute.UserTokens, {
              params: { id: params.id, tokenid: params.tokenid },
            }),
          },
        ]}
      ></PageHeader>
      <PageRoutedTabs
        backTab={{
          label: t('Back to User Tokens list'),
          page: AwxRoute.UserTokens,
          persistentFilterKey: 'user tokens',
        }}
        tabs={[{ label: t('Details'), page: AwxRoute.UserTokenDetails }]}
        params={{ id: params.id, tokenid: params.tokenid }}
      />
    </PageLayout>
  );
}
