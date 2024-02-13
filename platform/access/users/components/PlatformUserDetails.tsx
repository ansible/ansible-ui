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
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformItemsResponse } from '../../../interfaces/PlatformItemsResponse';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformRoute } from '../../../main/PlatformRoutes';
import { useUsersColumns } from '../hooks/useUserColumns';

export function PlatformUserDetails() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  const columns = useUsersColumns();
  const { data: user, isLoading } = useGetItem<PlatformUser>(gatewayV1API`/users/`, params.id);
  const { data: organizationsData } = useGet<PlatformItemsResponse<PlatformOrganization>>(
    gatewayV1API`/users/${params.id ?? ''}/organizations/`
  );
  if (isLoading) return <LoadingPage />;

  return (
    <PageDetails>
      <PageDetailsFromColumns columns={columns} item={user} />
      {organizationsData?.results?.length ? (
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
    </PageDetails>
  );
}
