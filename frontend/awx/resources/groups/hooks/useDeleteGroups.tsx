import { useTranslation } from 'react-i18next';
import { AwxGroup } from '../../../interfaces/AwxGroup';
import { useNameColumn } from '../../../../common/columns';
import { useMemo } from 'react';
import { useAwxBulkConfirmation } from '../../../common/useAwxBulkConfirmation';
import { compareStrings } from '../../../../../framework';
import { getItemKey, requestDelete } from '../../../../common/crud/Data';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGroupsColumns } from './useGroupsColumns';

export function useDeleteGroups(onComplete: (groups: AwxGroup[]) => void) {
  const { t } = useTranslation();
  const confirmationColumns = useGroupsColumns({ disableLinks: true, disableSort: true });
  const deleteActionNameColumn = useNameColumn({ disableLinks: true, disableSort: true });
  const actionColumns = useMemo(() => [deleteActionNameColumn], [deleteActionNameColumn]);
  const bulkAction = useAwxBulkConfirmation<AwxGroup>();
  const deleteGroups = (groups: AwxGroup[]) => {
    bulkAction({
      title: t('Permanently delete groups', { count: groups.length }),
      confirmText: t('Yes, I confirm that I want to delete these {{count}} groups.', {
        count: groups.length,
      }),
      actionButtonText: t('Delete groups', { count: groups.length }),
      items: groups.sort((l, r) => compareStrings(l.name, r.name)),
      keyFn: getItemKey,
      isDanger: true,
      confirmationColumns,
      actionColumns,
      onComplete,
      actionFn: (group: AwxGroup, signal) =>
        requestDelete(awxAPI`/groups/${group.id.toString()}/`, signal),
    });
  };
  return deleteGroups;
}
