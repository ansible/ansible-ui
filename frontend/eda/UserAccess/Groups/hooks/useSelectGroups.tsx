import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { EdaGroup } from '../../../interfaces/EdaGroup';
import { useEdaView } from '../../../useEventDrivenView';
import { useGroupFilters } from './useGroupFilters';
import { useGroupColumns } from './useGroupColumns';
import { API_PREFIX } from '../../../constants';

export function useSelectGroups() {
  const { t } = useTranslation();
  const toolbarFilters = useGroupFilters();
  const tableColumns = useGroupColumns();
  const view = useEdaView<EdaGroup>({
    url: `${API_PREFIX}/groups/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<EdaGroup, true>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
