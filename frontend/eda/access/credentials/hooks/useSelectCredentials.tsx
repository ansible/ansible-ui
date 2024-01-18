import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { edaAPI } from '../../../../eda/common/eda-utils';
import { useCredentialFilters } from './useCredentialFilters';
import { useCredentialColumns } from './useCredentialColumns';
import { EdaCredential } from '../../../interfaces/EdaCredential';
import { useEdaView } from '../../../common/useEventDrivenView';

export function useSelectCredentials(isLookup: boolean) {
  const { t } = useTranslation();
  const toolbarFilters = useCredentialFilters();
  const tableColumns = useCredentialColumns();
  const columns = useMemo(
    () => (isLookup ? tableColumns.filter((item) => ['Name'].includes(item.header)) : tableColumns),
    [isLookup, tableColumns]
  );
  const view = useEdaView<EdaCredential>({
    url: edaAPI`/credentials/`,
    toolbarFilters,
    tableColumns: columns,
    disableQueryString: true,
  });
  return useSelectDialog<EdaCredential, true>({
    toolbarFilters,
    tableColumns: columns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
