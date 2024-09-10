import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  LabelsCell,
  LoadingPage,
  PageDetail,
  PageDetails,
  PageDetailsFromColumns,
  useGetPageUrl,
} from '../../../../framework';
import { useGet, useGetItem } from '../../../../frontend/common/crud/useGet';
import { Authenticator } from '../../../interfaces/Authenticator';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { gatewayAPI } from '../../../utils/gateway-api-utils';
import { useReadableAuthenticatorTypes } from '../../authenticators/hooks/useReadableAuthenticatorTypes';
import { useUsersColumns } from '../hooks/useUserColumns';

export function PlatformUserDetails() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const columns = useUsersColumns({ disableLinks: true });
  const { data: user, isLoading } = useGetItem<PlatformUser>(gatewayAPI`/users/`, params.id);
  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayAPI`/users/${params.id ?? ''}/organizations/`
  );
  const { data: authenticators } = useGet<PlatformItemsResponse<Authenticator>>(
    gatewayAPI`/users/${params.id ?? ''}/authenticators/`
  );
  const readableAuthenticatorTypes = useReadableAuthenticatorTypes(authenticators?.results);
  if (isLoading) return <LoadingPage />;

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={user}>
        {' '}
        {user?.is_superuser ? null : organizationsData?.results?.length ? (
          <PageDetail label={t('Organization', { count: organizationsData.count })}>
            <LabelsCell
              numLabels={3}
              labelsWithLinks={organizationsData?.results.map((org) => ({
                name: org.name,
                link: getPageUrl(PlatformRoute.OrganizationDetails, {
                  params: { id: org.id },
                }),
              }))}
            />
          </PageDetail>
        ) : null}
        {authenticators?.results?.length && readableAuthenticatorTypes?.length ? (
          <PageDetail
            label={t('Authentication method', { count: readableAuthenticatorTypes?.length })}
          >
            <LabelsCell
              numLabels={3}
              labelsWithLinks={authenticators.results.map((authenticator, index) => ({
                name: readableAuthenticatorTypes[index],
                link: getPageUrl(PlatformRoute.AuthenticatorDetails, {
                  params: { id: authenticator.id },
                }),
              }))}
            />
          </PageDetail>
        ) : null}
      </PageDetailsFromColumns>
    </PageDetails>
  );
}
