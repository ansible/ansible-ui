import { Page } from '@patternfly/react-core';
import { t } from 'i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../framework';
import { EmptyStateCustom } from '../../framework/components/EmptyStateCustom';
import { LoadingState } from '../../framework/components/LoadingState';
import { AwxItemsResponse } from '../../frontend/awx/common/AwxItemsResponse';
import { gatewayAPI } from '../api/gateway-api-utils';
import { useGet } from '../../frontend/common/crud/useGet';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformResource() {
  const { resource_type, ansible_id, route } = useParams<{
    resource_type: string;
    ansible_id: string;
    route?: string;
  }>();
  const getPageUrl = useGetPageUrl();

  let resourceUrl: string | undefined = undefined;
  if (ansible_id) {
    switch (resource_type) {
      case 'shared.organization':
        resourceUrl = gatewayAPI`/organizations/?resource__ansible_id=${ansible_id}`;
        break;
      case 'shared.user':
        resourceUrl = gatewayAPI`/users/?resource__ansible_id=${ansible_id}`;
        break;
    }
  }

  const resourceResponse = useGet<AwxItemsResponse<{ id: number }>>(resourceUrl);

  if (resourceResponse.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (resourceResponse.error) {
    return (
      <Page>
        <EmptyStateCustom
          title={t('Error')}
          description={t('An error occurred while loading the resource.')}
        />
      </Page>
    );
  }

  if (!resourceResponse.data || resourceResponse.data?.results.length !== 1) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />
      </Page>
    );
  }

  let pageRoute = route;
  if (!pageRoute) {
    switch (resource_type) {
      case 'shared.organization':
        pageRoute = PlatformRoute.OrganizationDetails;
        break;
      case 'shared.team':
        pageRoute = PlatformRoute.TeamDetails;
        break;
      case 'shared.user':
        pageRoute = PlatformRoute.UserDetails;
        break;
    }
  }
  if (pageRoute) {
    return (
      <Navigate
        to={getPageUrl(pageRoute, {
          params: { id: resourceResponse.data.results[0].id },
        })}
        replace
      />
    );
  }

  return (
    <Page>
      <EmptyStateCustom title={t('Resource Not Found')} description="" />
    </Page>
  );
}
