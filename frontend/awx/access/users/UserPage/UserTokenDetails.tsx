import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { AwxRoute } from '../../../main/AwxRoutes';

export function UserTokenDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; tokenid: string }>();
  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader title="User token"></PageHeader>
      <PageRoutedTabs
        backTab={{
          label: t('Back to User Tokens list'),
          page: getPageUrl(AwxRoute.UserTokenDetails, { params: { id: params.id } }),
          persistentFilterKey: 'user tokens',
        }}
        tabs={[]}
        params={{ id: params.tokenid }}
      />
    </PageLayout>
  );
}
