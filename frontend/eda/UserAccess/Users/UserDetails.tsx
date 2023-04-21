import { DropdownPosition, Label, LabelGroup } from '@patternfly/react-core';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  PageDetails,
  PageDetail,
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaUser } from '../../interfaces/EdaUser';
import { useDeleteUsers } from './hooks/useDeleteUser';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user } = useGet<EdaUser>(`${API_PREFIX}/users/${params.id ?? ''}/`);

  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaUsers);
    }
  });

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
    </PageLayout>
  );
}
