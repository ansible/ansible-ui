import { DropdownPosition } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActions,
  PageActionType,
  PageHeader,
  PageLayout,
} from '../../../../framework';
import { PageDetailsFromColumns } from '../../../../framework';
import { useGet } from '../../../common/useItem';
import { RouteE } from '../../../Routes';
import { EdaUser } from '../../interfaces/EdaUser';
import { useUserColumns } from './hooks/useUserColumns';
import { API_PREFIX } from '../../constants';
import { useMemo } from 'react';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteUsers } from './hooks/useDeleteUser';

export function UserDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: User } = useGet<EdaUser>(`${API_PREFIX}/Users/${params.id ?? ''}/`);
  const tableColumns = useUserColumns();

  const deleteUsers = useDeleteUsers((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteE.EdaUsers);
    }
  });

  const itemActions = useMemo<IPageAction<EdaUser>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit User'),
        onClick: (User: EdaUser) => navigate(RouteE.EditEdaUser.replace(':id', User.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete User'),
        onClick: (User: EdaUser) => deleteUsers([User]),
        isDanger: true,
      },
    ],
    [deleteUsers, navigate, t]
  );
  return (
    <PageLayout>
      <PageHeader
        title={User?.name}
        breadcrumbs={[{ label: t('Users'), to: RouteE.EdaUsers }, { label: User?.name }]}
        headerActions={
          <PageActions<EdaUser>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={User}
          />
        }
      />
      <PageDetailsFromColumns item={User} columns={tableColumns} />
    </PageLayout>
  );
}
