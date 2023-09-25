/* eslint-disable react/prop-types */
import {
  ButtonVariant,
  DropdownPosition,
  Label,
  LabelGroup,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetail,
  PageDetails,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { LoadingPage } from '../../../../framework/components/LoadingPage';
import { useGet } from '../../../common/crud/useGet';
import { useEdaActiveUser } from '../../../common/useActiveUser';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaUser } from '../../interfaces/EdaUser';
import { ControllerTokens } from './ControllerTokens';
import { useDeleteUsers } from './hooks/useDeleteUser';

export function EdaUserDetails({ initialTabIndex = 0 }) {
  const params = useParams<{ id: string }>();
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  if (!user) return <LoadingPage breadcrumbs tabs />;
  return <EdaUserDetailsInternal initialTabIndex={initialTabIndex} user={user} />;
}

export function EdaMyDetails({ initialTabIndex = 0 }) {
  const { data: activeUser } = useGet<EdaUser>(`${API_PREFIX}/users/me/`);
  if (!activeUser) return <LoadingPage breadcrumbs tabs />;
  return <EdaUserDetailsInternal initialTabIndex={initialTabIndex} user={activeUser} />;
}

export function EdaUserDetailsInternal({
  initialTabIndex,
  user,
}: {
  initialTabIndex: number;
  user: EdaUser;
}) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted && deleted.length > 0) {
      pageNavigate(EdaRoute.Users);
    }
  });

  const renderUserDetailsTab = (user: EdaUser | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Username')}>{user?.username}</PageDetail>
        <PageDetail label={t('First name')}>{user?.first_name}</PageDetail>
        <PageDetail label={t('Last name')}>{user?.last_name}</PageDetail>
        <PageDetail label={t('Email')}>{user?.email}</PageDetail>
        <PageDetail label={t('Created')}>
          <DateTimeCell format="date-time" value={user?.created_at} />
        </PageDetail>
        <PageDetail label={t('Last modified')}>
          <DateTimeCell format="date-time" value={user?.modified_at} />
        </PageDetail>
        {user?.roles && user.roles.length ? (
          <PageDetail label={t('Role(s)')}>
            <LabelGroup>
              {user.roles.map((role) => (
                <Label key={role?.id}>{role?.name}</Label>
              ))}
            </LabelGroup>
          </PageDetail>
        ) : (
          <></>
        )}
      </PageDetails>
    );
  };
  const getPageUrl = useGetPageUrl();

  const activeUser = useEdaActiveUser();
  const isViewingSelf = Number(user.id) === Number(activeUser?.id);
  const canEditUser =
    activeUser?.is_superuser || activeUser?.roles.some((role) => role.name === 'Admin');
  const canViewUsers =
    activeUser?.is_superuser ||
    activeUser?.roles.some((role) => role.name === 'Admin' || role.name === 'Auditor');

  const itemActions = useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        label: t('Edit user'),
        isHidden: (_user: EdaUser) => !canEditUser,
        onClick: (user: EdaUser) => pageNavigate(EdaRoute.EditUser, { params: { id: user.id } }),
      },
      {
        type: PageActionType.Button,
        variant: ButtonVariant.primary,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        isPinned: true,
        isHidden: (_user: EdaUser) => canEditUser || !isViewingSelf,
        label: t('Edit user'),
        onClick: () => pageNavigate(EdaRoute.EditCurrentUser),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        isHidden: (_user: EdaUser) => isViewingSelf,
        onClick: (user: EdaUser) => deleteUsers([user]),
        isDanger: true,
      },
    ],
    [canEditUser, deleteUsers, isViewingSelf, pageNavigate, t]
  );
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
      {user ? (
        <PageTabs initialTabIndex={initialTabIndex}>
          <PageTab label={t('Details')}>{renderUserDetailsTab(user)}</PageTab>
          {isViewingSelf ? (
            <PageTab label={t('Controller Tokens')}>
              <ControllerTokens />
            </PageTab>
          ) : (
            <></>
          )}
        </PageTabs>
      ) : (
        <PageTabs>
          <PageTab>
            <PageSection variant="light">
              <Stack hasGutter>
                <Skeleton />
                <Skeleton />
                <Skeleton />
                <Skeleton />
              </Stack>
            </PageSection>
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}
