import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, PageNotImplemented } from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { AwxRoute } from '../../../main/AwxRoutes';

export function UserTokenDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string; tokenid: string }>();

  return (
    <PageLayout>
      <PageHeader title={t('Details')}></PageHeader>
      <PageRoutedTabs
        backTab={{
          label: t('Back to User Tokens list'),
          page: AwxRoute.UserTokens,
          persistentFilterKey: 'user tokens',
        }}
        tabs={[]}
        params={{ id: params.id }}
      />
      <PageNotImplemented></PageNotImplemented>
    </PageLayout>
  );
}
