import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';
import { useGetItem } from '../../../../frontend/common/crud/useGet';
import { PlatformOrganization } from '../../../interfaces/PlatformOrganization';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import {
  ICatalogBreadcrumb,
  LoadingPage,
  PageHeader,
  PageLayout,
  PageNotImplemented,
  useGetPageUrl,
} from '../../../../framework';
import { PlatformRoute } from '../../../main/PlatformRoutes';

export function PlatformOrganizationAddAccess() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string }>();

  const { data: organization, isLoading } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    params.id
  );

  const title = useMemo(() => {
    if (pathname.endsWith('/add-users')) {
      return t('Add users');
    } else if (pathname.endsWith('/add-teams')) {
      return t('Add teams');
    }
    return '';
  }, [pathname, t]);

  const breadcrumbs = useMemo<ICatalogBreadcrumb[]>(() => {
    const links: ICatalogBreadcrumb[] = [
      { label: t('Organizations'), to: getPageUrl(PlatformRoute.Organizations) },
      {
        label: organization?.name,
        to: getPageUrl(PlatformRoute.OrganizationDetails, { params: { id: organization?.id } }),
      },
    ];
    if (pathname.includes('/teams/')) {
      links.push({
        label: t('Teams'),
        to: getPageUrl(PlatformRoute.OrganizationTeams, { params: { id: organization?.id } }),
      });
    }
    if (pathname.includes('/users/')) {
      links.push({
        label: t('Users'),
        to: getPageUrl(PlatformRoute.OrganizationUsers, { params: { id: organization?.id } }),
      });
    }
    links.push(...[{ label: title }]);
    return links;
  }, [getPageUrl, organization?.id, organization?.name, pathname, t, title]);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <PageLayout>
      <PageHeader title={title} breadcrumbs={breadcrumbs} />
      {/* TODO */}
      <PageNotImplemented />
    </PageLayout>
  );
}
