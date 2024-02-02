import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../../framework';
import { useAwxView } from '../../common/useAwxView';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';

import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { AwxRoute } from '../../main/AwxRoutes';
import { useExecutionEnvRowActions } from './hooks/useExecutionEnvRowActions';
import { useExecutionEnvToolbarActions } from './hooks/useExecutionEnvToolbarActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { useExecutionEnvironmentsFilters } from './hooks/useExecutionEnvironmentsFilters';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const config = useAwxConfig();
  const toolbarFilters = useExecutionEnvironmentsFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const view = useAwxView<ExecutionEnvironment>({
    url: awxAPI`/execution_environments/`,
    toolbarFilters,
    tableColumns,
  });

  const rowActions = useExecutionEnvRowActions(view);
  const toolbarActions = useExecutionEnvToolbarActions(view);

  return (
    <PageLayout>
      <PageHeader
        title={t('Execution Environments')}
        description={t(
          'An execution environment allows you to have a customized image to run jobs.'
        )}
        titleHelpTitle={t('Execution Environments')}
        titleHelp={t(
          'Execution environments are container images that make it possible to incorporate system-level dependencies and collection-based content. Each execution environment allows you to have a customized image to run jobs, and each of them contain only what you need when running the job, nothing more.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/execution_environments.html`}
      />
      <PageTable<ExecutionEnvironment>
        id="awx-execution-environments-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={t('No execution environments yet')}
        emptyStateDescription={t('To get started, create an execution environment.')}
        emptyStateButtonText={t('Create execution environment')}
        emptyStateButtonClick={() => pageNavigate(AwxRoute.CreateExecutionEnvironment)}
        {...view}
        defaultSubtitle={t('Execution environment')}
      />
    </PageLayout>
  );
}
