import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IToolbarFilter, useSelectDialog } from '../../../../../framework';
import { EdaRole } from '../../../interfaces/EdaRole';
import { useEdaView } from '../../../useEventDrivenView';
import { useRoleColumns } from './useRoleColumns';
import { edaAPI } from '../../../api/eda-utils';

export function useSelectRoles() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns(false);
  const toolbarFilters = useRef<IToolbarFilter[]>([]);
  const view = useEdaView<EdaRole>({
    url: edaAPI`/roles/`,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<EdaRole, true>({
    toolbarFilters: toolbarFilters.current,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
