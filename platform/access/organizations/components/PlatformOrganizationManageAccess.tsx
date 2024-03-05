import { useEffect, useMemo, useState } from 'react';
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
import { requestGet } from '../../../../frontend/common/crud/Data';
import { PlatformUser } from '../../../interfaces/PlatformUser';
import { PlatformTeam } from '../../../interfaces/PlatformTeam';

export function PlatformOrganizationManageAccess() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const getPageUrl = useGetPageUrl();
  const { id, teamId, userId } = useParams<{ id: string; teamId: string; userId: string }>();

  const [team, setTeam] = useState<PlatformTeam | undefined>();
  const [user, setUser] = useState<PlatformUser | undefined>();

  useEffect(() => {
    async function fetchUserAndTeam() {
      let platformUser: PlatformUser;
      let platformTeam: PlatformTeam;
      if (userId) {
        platformUser = await requestGet<PlatformUser>(gatewayV1API`/users/${userId}/`);
        setUser(platformUser);
      }
      if (teamId) {
        platformTeam = await requestGet<PlatformTeam>(gatewayV1API`/teams/${teamId}/`);
        setTeam(platformTeam);
      }
    }

    void fetchUserAndTeam();
  }, [teamId, userId]);

  const { data: organization, isLoading } = useGetItem<PlatformOrganization>(
    gatewayV1API`/organizations`,
    id
  );

  const title = useMemo(() => {
    if (pathname.endsWith('/add-users')) {
      return t('Add users');
    } else if (pathname.endsWith('/add-teams')) {
      return t('Add roles');
    } else if (pathname.endsWith('/manage-roles')) {
      return t(`Manage roles for ${team?.name ? team?.name : user?.username}`);
    }
    return '';
  }, [pathname, t, team?.name, user?.username]);

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
      if (pathname.endsWith('/manage-roles')) {
        links.push({
          label: team?.name,
        });
      }
    }
    if (pathname.includes('/users/')) {
      links.push({
        label: t('Users'),
        to: getPageUrl(PlatformRoute.OrganizationUsers, { params: { id: organization?.id } }),
      });
      if (pathname.endsWith('/manage-roles')) {
        links.push({
          label: user?.username,
        });
      }
    }
    links.push(...[{ label: title }]);
    return links;
  }, [
    getPageUrl,
    organization?.id,
    organization?.name,
    pathname,
    t,
    team?.name,
    title,
    user?.username,
  ]);

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
