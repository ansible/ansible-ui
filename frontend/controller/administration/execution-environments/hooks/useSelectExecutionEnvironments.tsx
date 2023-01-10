import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useControllerView } from '../../../useControllerView';
import {
  useExecutionEnvironmentsColumns,
  useExecutionEnvironmentsFilters,
} from '../../execution-environments/ExecutionEnvironments';

export function useSelectExecutionEnvironments() {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const view = useControllerView<ExecutionEnvironment>({
    url: '/api/v2/execution-environments/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return useSelectDialog<ExecutionEnvironment>({
    toolbarFilters,
    tableColumns,
    view,
    confirm: t('Confirm'),
    cancel: t('Cancel'),
    selected: t('Selected'),
  });
}
