import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageHeader, PageLayout, useGetPageUrl } from '../../../../framework';
import { PageRoutedTabs } from '../../../../framework/PageTabs/PageRoutedTabs';
import { useGet } from '../../../common/crud/useGet';
import { edaAPI } from '../../common/eda-utils';
import { EdaRole } from '../../interfaces/EdaRole';
import { EdaRoute } from '../../main/EdaRoutes';

export function EdaRolePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: role } = useGet<EdaRole>(edaAPI`/roles/${params.id ?? ''}/`);

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
