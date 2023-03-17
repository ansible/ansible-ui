import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Credential } from '../../../interfaces/Credential';
import { useAwxView } from '../../../useAwxView';
import { useCredentialsColumns } from './useCredentialsColumns';
import { useCredentialsFilters } from './useCredentialsFilters';

export function useSelectCredential() {
  const { t } = useTranslation();
  const toolbarFilters = useCredentialsFilters();
  const tableColumns = useCredentialsColumns({ disableLinks: true });

  const view = useAwxView<Credential>({
    url: '/api/v2/credentials/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Credential, true>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
    isMultiple: true,
  });
}
