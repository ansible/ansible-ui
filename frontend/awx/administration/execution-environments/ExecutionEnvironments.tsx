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
import { useOptions } from '../../../common/crud/useOptions';
import { OptionsResponse, ActionsResponse } from '../../interfaces/OptionsResponse';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { PlusCircleIcon } from '@patternfly/react-icons';

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

  const { data } = useOptions<OptionsResponse<ActionsResponse>>(awxAPI`/execution_environments/`);
  const canCreateExecutionEnvironment = Boolean(data && data.actions && data.actions['POST']);

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
        headerActions={<ActivityStreamIcon type={'execution_environment'} />}
      />
      <PageTable<ExecutionEnvironment>
        id="awx-execution-environments-table"
        toolbarFilters={toolbarFilters}
        toolbarActions={toolbarActions}
        tableColumns={tableColumns}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyStateTitle={
          canCreateExecutionEnvironment
            ? t('No execution environments yet')
            : t('You do not have permission to create an execution environment.')
        }
        emptyStateDescription={
          canCreateExecutionEnvironment
            ? t('To get started, create an execution environment.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={
          canCreateExecutionEnvironment ? t('Create execution environment') : undefined
        }
        emptyStateButtonClick={
          canCreateExecutionEnvironment
            ? () => pageNavigate(AwxRoute.CreateExecutionEnvironment)
            : undefined
        }
        {...view}
        defaultSubtitle={t('Execution environment')}
      />
    </PageLayout>
  );
}
