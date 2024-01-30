import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { pulpAPI } from '../../../common/api/formatPath';
import { Role } from '../Role';
import { useGet } from '../../../../common/crud/useGet';
import { useRoleRowActions } from '../hooks/useRoleActions';
import {
  LoadingPage,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { HubError } from '../../../common/HubError';
import { HubRoute } from '../../../main/HubRoutes';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { PulpItemsResponse } from '../../../common/useHubView';

export function RolePage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data, error, refresh } = useGet<PulpItemsResponse<Role>>(
    pulpAPI`/roles/?name=${params.id}`
  );
  const role = data?.results?.[0];
  const pageNavigate = usePageNavigate();
  const actions = useRoleRowActions(() => pageNavigate(HubRoute.Roles));
  const getPageUrl = useGetPageUrl();

  if (error) return <HubError error={error} handleRefresh={refresh} />;
  if (!role) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: getPageUrl(HubRoute.Roles) }, { label: role?.name }]}
        headerActions={
          <PageActions<Role>
            actions={actions}
            position={DropdownPosition.right}
            selectedItem={role}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Roles'),
          page: HubRoute.Roles,
          persistentFilterKey: 'hub-roles',
        }}
        tabs={[{ label: t('Details'), page: HubRoute.RoleDetails }]}
        params={{ id: role.name ?? '' }}
      />
    </PageLayout>
  );
}
