import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useGetPageUrl } from '../../framework';
import { EmptyStateCustom } from '../../framework/components/EmptyStateCustom';
import { LoadingState } from '../../framework/components/LoadingState';
import { edaAPI } from '../../frontend/eda/common/eda-utils';
import { EdaUser } from '../../frontend/eda/interfaces/EdaUser';
import { useGetItem } from '../../frontend/common/crud/useGet';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformEdaUser(props: { route?: string }) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
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
    <Page>
      <EmptyStateCustom
        title={t('Error')}
        description={t('An error occurred while loading the resource.')}
      />
    </Page>;
  }

  if (!platformResponse.data?.resource.resource_type) {
    return (
      <Page>
        <EmptyStateCustom title={t('Resource Not Found')} description="" />;
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
