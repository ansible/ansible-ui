import { useParams } from 'react-router-dom';
import { HubItemsResponse } from '../../common/useHubView';
import { HubNamespace } from '../HubNamespace';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../common/api/formatPath';
import { LoadingPage } from '../../../../framework';
import { HubError } from '../../common/HubError';
import { useMemo } from 'react';
import { useHubContext } from '../../common/useHubContext';
import { HubResourceAccessTeams } from '../../access/resource-access/HubResourceAccessTeams';
import { useUpdatePageBreadcrumbs } from '../../../../framework/hooks/usePageBreadcrumbsContext';
import { useTranslation } from 'react-i18next';

export function NamespaceTeamAccess() {
  const params = useParams<{ id: string }>();
  const {
    data: response,
    error,
    refresh,
  } = useGet<HubItemsResponse<HubNamespace>>(
    hubAPI`/_ui/v1/namespaces/?limit=1&name=${params.id ?? ''}&include_related=my_permissions`
  );
  const namespace = useMemo<HubNamespace | undefined>(
    () => (response && response.data?.length ? response.data[0] : undefined),
    [response]
  );
  const { hasPermission, user } = useHubContext();
  const canEditAccess =
    hasPermission('galaxy.change_namespace') ||
    namespace?.related_fields?.my_permissions?.includes?.('galaxy.change_namespace') ||
    user.is_superuser;
  const { t } = useTranslation();
  useUpdatePageBreadcrumbs({
    label: t('Team Access'),
  });

  if (!response || !response.data || (response.data.length === 0 && !error)) {
    return <LoadingPage />;
  }

  if (error) {
    return <HubError error={error} handleRefresh={refresh} />;
  }

  return <HubResourceAccessTeams teams={namespace?.groups ?? []} canEditAccess={canEditAccess} />;
}
