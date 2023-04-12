import { DropdownPosition } from '@patternfly/react-core';
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
} from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaRole } from '../../interfaces/EdaRole';
import { useDeleteRoles } from './hooks/useDeleteRole';
import { useRoleColumns } from './hooks/useRoleColumns';

export function RoleDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role } = useGet<EdaRole>(`${API_PREFIX}/roles/${params.id ?? ''}/`);
  const tableColumns = useRoleColumns();

  const deleteRoles = useDeleteRoles((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaRoles);
    }
  });

  const itemActions = useMemo<IPageAction<EdaRole>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit Role'),
        onClick: (role: EdaRole) =>
          navigate(RouteObj.EditEdaRole.replace(':id', role.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
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
        breadcrumbs={[{ label: t('Roles'), to: RouteObj.EdaRoles }, { label: role?.name }]}
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
