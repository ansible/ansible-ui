import { DropdownPosition } from '@patternfly/react-core';
import { PencilAltIcon, TrashIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageActions,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  useGetPageUrl,
  usePageNavigate,
} from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { EdaRoute } from '../../EdaRoutes';
import { API_PREFIX, SWR_REFRESH_INTERVAL } from '../../constants';
import { EdaGroup } from '../../interfaces/EdaGroup';
import { useDeleteGroups } from './hooks/useDeleteGroup';
import { useGroupColumns } from './hooks/useGroupColumns';

export function GroupDetails() {
  const { t } = useTranslation();
  const params = useParams<{ id: string }>();
  const pageNavigate = usePageNavigate();
  const { data: group } = useGet<EdaGroup>(`${API_PREFIX}/groups/${params.id ?? ''}/`, undefined, {
    refreshInterval: SWR_REFRESH_INTERVAL,
  });
  const tableColumns = useGroupColumns();

  const deleteGroups = useDeleteGroups((deleted) => {
    if (deleted.length > 0) {
      pageNavigate(EdaRoute.Groups);
    }
  });

  const itemActions = useMemo<IPageAction<EdaGroup>[]>(
    () => [
      {
        type: PageActionType.Button,
        selection: PageActionSelection.Single,
        icon: PencilAltIcon,
        label: t('Edit group'),
        onClick: (group: EdaGroup) =>
          pageNavigate(EdaRoute.EditGroup, { params: { id: group.id } }),
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
    [deleteGroups, pageNavigate, t]
  );

  const getPageUrl = useGetPageUrl();

  return (
    <PageLayout>
      <PageHeader
        title={group?.name}
        breadcrumbs={[
          { label: t('Groups'), to: getPageUrl(EdaRoute.Groups) },
          { label: group?.name },
        ]}
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
