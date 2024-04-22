import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { PageTable, usePageNavigate } from '../../../../../framework';
import { awxAPI } from '../../../common/api/awx-utils';
import { useAwxView } from '../../../common/useAwxView';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { ExecutionEnvironment } from '../../../interfaces/generated-from-swagger/api';
import { useExecutionEnvironmentFilters } from '../../../../hub/execution-environments/hooks/useExecutionEnvironmentFilters';
import { useExecutionEnvironmentsColumns } from '../../../administration/execution-environments/hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from '../../../administration/execution-environments/hooks/useExecutionEnvironmentsFilters';

export function OrganizationExecutionEnvironments() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const pageHistory = usePageNavigate();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useAwxView<ExecutionEnvironment>({
    url: awxAPI`/organizations/${params.id ?? ''}/execution_environments/`,
    toolbarFilters,
    tableColumns,
    disableQueryString: true,
  });
  return (
    <PageTable<ExecutionEnvironment>
      id="awx-execution-environments-table"
      toolbarFilters={toolbarFilters}
      tableColumns={tableColumns}
      errorStateTitle={t('Error loading teams')}
      emptyStateTitle={t('No execution environments yet')}
      emptyStateDescription={t('To get started, create an execution environment.')}
      emptyStateButtonIcon={<PlusCircleIcon />}
      emptyStateButtonText={t('Create execution environment')}
      emptyStateButtonClick={() => pageHistory(AwxRoute.CreateExecutionEnvironment)}
      {...view}
    />
  );
}
