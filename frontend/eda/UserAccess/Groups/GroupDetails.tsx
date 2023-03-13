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
import { RouteObj } from '../../../Routes';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { useGroupColumns } from './hooks/useGroupColumns';
import { API_PREFIX } from '../../constants';
import { useMemo } from 'react';
import { EditIcon, TrashIcon } from '@patternfly/react-icons';
import { useDeleteGroups } from './hooks/useDeleteGroup';

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
        type: PageActionType.single,
        icon: EditIcon,
        label: t('Edit Group'),
        onClick: (group: EdaGroup) =>
          navigate(RouteObj.EditEdaGroup.replace(':id', group.id.toString())),
      },
      {
        type: PageActionType.single,
        icon: TrashIcon,
        label: t('Delete Group'),
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
