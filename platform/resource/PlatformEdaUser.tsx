import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { edaAPI } from '@ansible/eda-ui/common/eda-utils';
import { EdaUser } from '@ansible/eda-ui/interfaces/EdaUser';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useGetItem } from '../../frontend/common/crud/useGet';
import { usePlatformActiveUser } from '../main/PlatformActiveUserProvider';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformEdaUser(props: { route?: string }) {
  const { t } = useTranslation();
  const { id: idFromParam } = useParams<{ id: string }>();
  const { activePlatformUser: activeUser } = usePlatformActiveUser();
  const id = idFromParam || activeUser?.id;
  const platformResponse = useGetItem<EdaUser>(edaAPI`/users/`, id);
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
          resource_type: platformResponse?.data?.resource?.resource_type as string,
          ansible_id: platformResponse?.data?.resource?.ansible_id as string,
          route: props.route || PlatformRoute.UserDetails,
        },
      })}
      replace
    />
  );
}
