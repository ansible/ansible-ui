import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
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
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxRoute } from '../../../AwxRoutes';
import { AwxError } from '../../../common/AwxError';
import { User } from '../../../interfaces/User';
import { useDeleteUsers } from '../hooks/useDeleteUsers';
import { awxAPI } from '../../../api/awx-utils';

export function UserPage() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const { error, data: user, refresh } = useGetItem<User>(awxAPI`/users`, params.id);
  const pageNavigate = usePageNavigate();

  const deleteUsers = useDeleteUsers((deleted: User[]) => {
    if (deleted.length > 0) {
      pageNavigate(AwxRoute.Users);
    }
  });

  const itemActions: IPageAction<User>[] = useMemo(() => {
    const itemActions: IPageAction<User>[] = [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        variant: ButtonVariant.primary,
        isPinned: true,
        icon: EditIcon,
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
          <PageActions<User>
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
        tabs={[
          { label: t('Details'), page: AwxRoute.UserDetails },
          { label: t('Organizations'), page: AwxRoute.UserOrganizations },
          { label: t('Teams'), page: AwxRoute.UserTeams },
          { label: t('Roles'), page: AwxRoute.UserRoles },
        ]}
        params={{ id: user.id }}
      />
    </PageLayout>
  );
}
