import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useAwxView } from '../../../useAwxView';
import {
  useExecutionEnvironmentsColumns,
  useExecutionEnvironmentsFilters,
} from '../ExecutionEnvironments';

export function useSelectExecutionEnvironments(organizationId?: string) {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns({ disableLinks: true });
  const defaultParams: {
    order_by: string;
    or__organization__isnull: string;
    [key: string]: string;
  } = {
    order_by: 'name',
    or__organization__isnull: 'True',
  };
  if (organizationId) {
    defaultParams.or__organization__id = organizationId;
  }
  const view = useAwxView<ExecutionEnvironment>({
    url: '/api/v2/execution_environments/',
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
    queryParams: defaultParams,
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
