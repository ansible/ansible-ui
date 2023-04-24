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
import { EdaGroup } from '../../interfaces/EdaGroup';
import { useDeleteGroups } from './hooks/useDeleteGroup';
import { useGroupColumns } from './hooks/useGroupColumns';

export function GroupDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: group } = useGet<EdaGroup>(`${API_PREFIX}/groups/${params.id ?? ''}/`);
  const tableColumns = useGroupColumns();

  const deleteGroups = useDeleteGroups((deleted) => {
    if (deleted.length > 0) {
      navigate(RouteObj.EdaGroups);
    }
  });

  const itemActions = useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: EditIcon,
        label: t('Edit group'),
        onClick: (group: EdaGroup) =>
          navigate(RouteObj.EditEdaGroup.replace(':id', group.id.toString())),
      },
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: TrashIcon,
        label: t('Delete group'),
        onClick: (group: EdaGroup) => deleteGroups([group]),
        isDanger: true,
      },
    ],
    [deleteGroups, navigate, t]
  );
  return (
    <PageLayout>
      <PageHeader
        title={group?.name}
        breadcrumbs={[{ label: t('Groups'), to: RouteObj.EdaGroups }, { label: group?.name }]}
        headerActions={
          <PageActions<EdaGroup>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={group}
          />
        }
      />
      <PageDetailsFromColumns item={group} columns={tableColumns} />
    </PageLayout>
  );
}
