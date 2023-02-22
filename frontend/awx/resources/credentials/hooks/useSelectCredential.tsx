import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Credential } from '../../../interfaces/Credential';
import { useControllerView } from '../../../useControllerView';
import { useCredentialsColumns, useCredentialsFilters } from '../Credentials';

export function useSelectCredential() {
  const { t } = useTranslation();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns({ disableLinks: true });
  const view = useControllerView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Credential>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
