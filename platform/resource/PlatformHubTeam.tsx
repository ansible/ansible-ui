import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { HubTeam } from '@ansible/hub-ui/interfaces/expanded/HubTeam';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformHubTeam(props: { route?: string }) {
  const { t } = useTranslation();
  const { id: idFromParam } = useParams<{ id: string }>();
  const id = idFromParam;
  const platformResponse = useGetItem<HubTeam>(hubAPI`/_ui/v2/teams/`, id);
  const getPageUrl = useGetPageUrl();

  if (platformResponse.isLoading) {
    return (
      <Page>
        <LoadingState />
      </Page>
    );
  }

  if (platformResponse.error) {
    return (
      <Page>
        <EmptyStateCustom
          title={t('Error')}
          description={t('An error occurred while loading the resource.')}
        />
      </Page>
    );
  }

  if (!platformResponse.data?.resource.resource_type) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description={`id: ${id}`} />;
      </Page>
    );
  }

  return (
    <Navigate
      to={getPageUrl(PlatformRoute.PlatformResourceRoute, {
        params: {
          resource_type: platformResponse.data.resource.resource_type,
          ansible_id: platformResponse.data.resource.ansible_id,
          route: props.route || PlatformRoute.TeamDetails,
        },
      })}
      replace
    />
  );
}
