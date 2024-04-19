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
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxActiveUser } from '../../../common/useAwxActiveUser';
import { AwxUser } from '../../../interfaces/User';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useDeleteUsers } from '../hooks/useDeleteUsers';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<AwxUser>(awxAPI`/users`, params.id);
  const pageNavigate = usePageNavigate();
  const { activeAwxUser } = useAwxActiveUser();

  const deleteUsers = useDeleteUsers((deleted: AwxUser[]) => {
    if (deleted.length > 0) {
      pageNavigate(AwxRoute.Users);
    }
  });

  const itemActions: IPageAction<AwxUser>[] = useMemo(() => {
    const itemActions: IPageAction<AwxUser>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: PencilAltIcon,
        label: t('Edit user'),
        onClick: (user) => pageNavigate(AwxRoute.EditUser, { params: { id: user.id } }),
      },
      { type: PageActionType.Seperator },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user) => deleteUsers([user]),
        isDanger: true,
      },
    ];
    return itemActions;
  }, [t, pageNavigate, deleteUsers]);

  const getPageUrl = useGetPageUrl();

  const pageTabs = [
    { label: t('Details'), page: AwxRoute.UserDetails },
    { label: t('Organizations'), page: AwxRoute.UserOrganizations },
    { label: t('Teams'), page: AwxRoute.UserTeams },
    { label: t('Roles'), page: AwxRoute.UserRoles },
  ];

  // add tokens tab if the user from params(URL path) matches active user
  if (activeAwxUser?.id !== undefined && activeAwxUser?.id.toString() === params.id) {
    pageTabs.push({ label: t('Tokens'), page: AwxRoute.UserTokens });
  }

  if (error) return <AwxError error={error} handleRefresh={refresh} />;
  if (!user) return <LoadingPage breadcrumbs tabs />;

  return (
    <PageLayout>
      <PageHeader
        title={user.username}
        breadcrumbs={[
          { label: t('Users'), to: getPageUrl(AwxRoute.Users) },
          { label: user.username },
        ]}
        headerActions={
          <PageActions<AwxUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Users'),
          page: AwxRoute.Users,
          persistentFilterKey: 'users',
        }}
        tabs={pageTabs}
        params={{ id: user.id }}
      />
    </PageLayout>
  );
}
