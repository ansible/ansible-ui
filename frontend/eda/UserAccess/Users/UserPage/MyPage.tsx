/* eslint-disable react/prop-types */
import { ButtonVariant } from '@patternfly/react-core';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { PencilAltIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
import { EdaRoute } from '../../../EdaRoutes';
import { edaAPI } from '../../../api/eda-utils';
import { useEdaActiveUser } from '../../../common/useEdaActiveUser';
import { EdaUser } from '../../../interfaces/EdaUser';

export function MyPage() {
  const { data: user } = useGet<EdaUser>(edaAPI`/users/me/`);
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const getPageUrl = useGetPageUrl();

  const activeUser = useEdaActiveUser();
  const canEditUser =
    !!activeUser?.is_superuser || !!activeUser?.roles.some((role) => role.name === 'Admin');
  const canViewUsers =
    !!activeUser?.is_superuser ||
    !!activeUser?.roles.some((role) => role.name === 'Admin' || role.name === 'Auditor');

  const isActionTab = location.pathname === `/eda/access/users/me/details`;
  const itemActions = useMemo<IPageAction<EdaUser>[]>(() => {
    const actions: IPageAction<EdaUser>[] = isActionTab
      ? [
          {
            type: PageActionType.Button,
            variant: ButtonVariant.primary,
            selection: PageActionSelection.Single,
            icon: PencilAltIcon,
            isPinned: true,
            label: t('Edit user'),
            isHidden: (_user: EdaUser) => !canEditUser,
            onClick: (user: EdaUser) =>
              pageNavigate(EdaRoute.EditUser, { params: { id: user?.id } }),
          },
          {
            type: PageActionType.Button,
            variant: ButtonVariant.primary,
            selection: PageActionSelection.Single,
            icon: PencilAltIcon,
            isPinned: true,
            isHidden: (_user: EdaUser) => canEditUser,
            label: t('Edit user'),
            onClick: () => pageNavigate(EdaRoute.EditCurrentUser),
          },
          {
            type: PageActionType.Seperator,
          },
        ]
      : [];
    return actions;
  }, [canEditUser, pageNavigate, isActionTab, t]);
  if (!activeUser) return <LoadingPage breadcrumbs tabs />;
  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={
          canViewUsers
            ? [{ label: t('Users'), to: getPageUrl(EdaRoute.Users) }, { label: user?.username }]
            : undefined
        }
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      <PageRoutedTabs
        tabs={[
          { label: t('Details'), page: EdaRoute.MyDetails },
          { label: t('Controller Tokens'), page: EdaRoute.MyTokens },
        ]}
        params={{ id: user?.id }}
      />
    </PageLayout>
  );
}
