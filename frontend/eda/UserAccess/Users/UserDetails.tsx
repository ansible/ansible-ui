import {
  DropdownPosition,
  Label,
  LabelGroup,
  PageSection,
  Skeleton,
  Stack,
} from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageHeader,
  PageLayout,
  PageDetails,
  PageDetail,
  PageTabs,
  PageTab,
  PageTable,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaUser } from '../../interfaces/EdaUser';
import { useDeleteUsers } from './hooks/useDeleteUser';
import { useEdaView } from '../../useEventDrivenView';
import { useControllerTokensColumns } from './hooks/useControllerTokensColumns';
import { EdaControllerToken } from '../../interfaces/EdaControllerToken';
import { EdaUserInfo } from '../../../common/Masthead';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/${params.id ?? ''}/`);

  const me = EdaUserInfo();
  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted && deleted.length > 0) {
      navigate(RouteObj.EdaUsers);
    }
  });

  const renderUserDetailsTab = (user: EdaUser | undefined): JSX.Element => {
    return (
      <PageDetails>
        <PageDetail label={t('Username')}>{user?.username}</PageDetail>
        <PageDetail label={t('First name')}>{user?.first_name}</PageDetail>
        <PageDetail label={t('Last name')}>{user?.last_name}</PageDetail>
        <PageDetail label={t('Email')}>{user?.email}</PageDetail>
        {user?.roles && user.roles.length ? (
          <PageDetail label={t('Roles')}>
            <LabelGroup>
              {user?.roles.map((role) => (
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
  const itemActions = useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit user'),
        onClick: (user: EdaUser) =>
          navigate(RouteObj.EditEdaUser.replace(':id', user.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete user'),
        onClick: (user: EdaUser) => deleteUsers([user]),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );

  function ControllerTokensTab() {
    const tableColumns = useControllerTokensColumns();

    const view = useEdaView<EdaControllerToken>({
      url: `${API_PREFIX}/users/me/awx-tokens/`,
      tableColumns,
    });
    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          errorStateTitle={t('Error loading controller tokens')}
          emptyStateTitle={t('You currently do not have any tokens from Automation Controller.')}
          emptyStateDescription={t(
            'Please create a token from Automation Controller by using the button below.'
          )}
          emptyStateButtonText={t('Create controller token')}
          emptyStateButtonClick={() => navigate(RouteObj.CreateEdaControllerToken)}
          {...view}
          defaultSubtitle={t('Controller tokens')}
        />
      </PageLayout>
    );
  }
  return (
    <PageLayout>
      <PageHeader
        title={user?.username}
        breadcrumbs={[{ label: t('Users'), to: RouteObj.EdaUsers }, { label: user?.username }]}
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={user}
          />
        }
      />
      {user ? (
        <PageTabs>
          <PageTab label={t('Details')}>{renderUserDetailsTab(user)}</PageTab>
          {user.id === me?.id ? (
            <PageTab label={t('Controller Tokens')}>
              <ControllerTokensTab />
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
