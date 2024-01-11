import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { SWR_REFRESH_INTERVAL } from '../../common/eda-constants';
import { edaAPI } from '../../common/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';
import { EdaRoute } from '../../main/EdaRoutes';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';

export function EdaRolePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(edaAPI`/roles/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(EdaRoute.Roles) }, { label: role?.name }]}
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Roles'),
          page: EdaRoute.Roles,
          persistentFilterKey: 'eda-roles',
        }}
        tabs={[{ label: t('Details'), page: EdaRoute.RoleDetails }]}
        params={{ id: role?.id ?? '' }}
      />
    </PageLayout>
  );
}
