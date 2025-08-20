import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { hubAPI } from '@ansible/hub-ui/common/api/formatPath';
import { HubUser } from '@ansible/hub-ui/interfaces/expanded/HubUser';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { usePlatformActiveUser } from '../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformHubUser(props: { route?: string }) {
  const { t } = useTranslation();
  const { id: idFromParam } = useParams<{ id: string }>();
  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const id = idFromParam || activeUser?.id;
  const platformResponse = useGetItem<HubUser>(hubAPI`/_ui/v2/users/`, id);
  const getPageUrl = useGetPageUrl();

  if (platformResponse.isLoading) {
    return <LoadingState />;
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
          route: props.route || PlatformRoute.UserDetails,
        },
      })}
      replace
    />
  );
}
