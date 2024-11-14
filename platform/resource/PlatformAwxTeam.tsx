import { useGetPageUrl } from '@ansible/ansible-ui-framework';
import { EmptyStateCustom } from '@ansible/ansible-ui-framework/components/EmptyStateCustom';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { Team } from '@ansible/awx-ui/interfaces/Team';
import { Page } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';
import { useGetItem } from '../../frontend/common/crud/useGet';
import { PlatformRoute } from '../main/PlatformRoutes';

export function PlatformAwxTeam(props: { route?: string }) {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const platformResponse = useGetItem<Team>(awxAPI`/teams/`, id);
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

  if (!platformResponse.data?.summary_fields.resource.resource_type) {
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
          resource_type: platformResponse.data.summary_fields.resource.resource_type,
          ansible_id: platformResponse.data.summary_fields.resource.ansible_id,
          route: props.route || PlatformRoute.TeamDetails,
        },
      })}
      replace
    />
  );
}
