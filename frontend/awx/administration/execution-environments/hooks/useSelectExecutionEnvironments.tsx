import { useTranslation } from 'react-i18next';
import { useSelectDialog } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { ExecutionEnvironment } from '../../../interfaces/ExecutionEnvironment';
import { useExecutionEnvironmentsColumns } from './useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from './useExecutionEnvironmentsFilters';

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
    url: awxAPI`/execution_environments/`,
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
