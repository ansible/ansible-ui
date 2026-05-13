import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../main/AwxRoutes';

export function DeprecationDetailPage() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const getPageUrl = useGetPageUrl();
  const decodedType = decodeURIComponent(deprecationType ?? '');

  return (
    <PageLayout>
      <PageHeader
        title={decodedType}
        breadcrumbs={[
          { label: t('Deprecations'), to: getPageUrl(AwxRoute.Deprecations) },
          { label: decodedType },
        ]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Deprecations'),
          page: AwxRoute.Deprecations,
          persistentFilterKey: 'deprecations',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.DeprecationDetails },
          { label: t('Affected Jobs'), page: AwxRoute.DeprecationAffectedJobs },
        ]}
        params={{ deprecationType: deprecationType ?? '' }}
      />
    </PageLayout>
  );
}
