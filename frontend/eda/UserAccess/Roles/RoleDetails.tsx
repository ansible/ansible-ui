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
import { EdaRole } from '../../interfaces/EdaRole';
import { useRoleColumns } from './hooks/useRoleColumns';
import { API_PREFIX } from '../../constants';
import { useMemo } from 'react';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteRoles } from './hooks/useDeleteRole';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role } = useGet<EdaRole>(`${API_PREFIX}/roles/${params.id ?? ''}/`);
  const tableColumns = useRoleColumns();

  const deleteRoles = useDeleteRoles((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteE.EdaRoles);
    }
  });

  const itemActions = useMemo<IPageAction<EdaRole>[]>(
    () => [
      {
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit Role'),
        onClick: (role: EdaRole) => navigate(RouteE.EditEdaRole.replace(':id', role.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete Role'),
        onClick: (role: EdaRole) => deleteRoles([role]),
        isDanger: true,
      },
    ],
    [deleteRoles, navigate, t]
  );
  return (
    <PageLayout>
      <PageHeader
        title={role?.name}
        breadcrumbs={[{ label: t('Roles'), to: RouteE.EdaRoles }, { label: role?.name }]}
        headerActions={
          <PageActions<EdaRole>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={role}
          />
        }
      />
      <PageDetailsFromColumns item={role} columns={tableColumns} />
    </PageLayout>
  );
}
