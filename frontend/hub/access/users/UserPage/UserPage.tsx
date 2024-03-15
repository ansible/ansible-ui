/* eslint-disable react/prop-types */
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../../framework';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGet } from '../../../../common/crud/useGet';
import { hubAPI } from '../../../common/api/formatPath';
import { useHubContext } from '../../../common/useHubContext';
import { HubUser } from '../../../interfaces/expanded/HubUser';
import { HubRoute } from '../../../main/HubRoutes';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<HubUser>(params?.id ? hubAPI`/_ui/v1/users/${params.id}/` : null);
  const pageNavigate = usePageNavigate();

  const getPageUrl = useGetPageUrl();

  const activeUser = useHubContext().user;
  const isViewingSelf = Number(user?.id) === Number(activeUser?.id);
  const canEditUser =
    activeUser?.is_superuser || activeUser?.roles.some((role) => role.name === 'Admin');
  const canViewUsers =
    activeUser?.is_superuser ||
    activeUser?.roles.some((role) => role.name === 'Admin' || role.name === 'Auditor');

  const isActionTab =
    location.pathname === getPageUrl(HubRoute.UserDetails, { params: { id: user?.id } });

  if (!activeUser) return <LoadingPage breadcrumbs tabs />;

  const tabs = [
    { label: t('Details'), page: HubRoute.UserDetails },
    { label: t('Teams'), page: HubRoute.UserTeams },
    isViewingSelf ? { label: t('Controller Tokens'), page: HubRoute.UserTokens } : null,
  ].filter(Boolean);

  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={
          canViewUsers
            ? [{ label: t('Users'), to: getPageUrl(HubRoute.Users) }, { label: user?.username }]
            : undefined
        }
        headerActions={
          <PageActions<HubUser>
            actions={[]}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Users'),
          page: HubRoute.Users,
          persistentFilterKey: 'users',
        }}
        tabs={tabs}
        params={{ id: user?.id }}
      />
    </PageLayout>
  );
}
