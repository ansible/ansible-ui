import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { Organization } from '../../../interfaces/Organization';
import { useControllerView } from '../../../useControllerView';
import {
  useOrganizationsColumns,
  useOrganizationsFilters,
} from '../../organizations/Organizations';

export function useSelectOrganization() {
  const { t } = useTranslation();
  const toolbarFilters = useOrganizationsFilters();
  const tableColumns = useOrganizationsColumns({ disableLinks: true });
  const view = useControllerView<Organization>({
    url: '/api/v2/organizations/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<Organization>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
