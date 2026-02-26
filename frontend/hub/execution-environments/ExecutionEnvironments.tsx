import {
  PageTable,
  useGetPageUrl,
  PageLayoutWithUnauthorized,
} from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { Button, ButtonVariant, Flex } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../common/api/formatPath';
import { filterInsightsBulkActions } from '../common/isInsights';
import { useHubConfig } from '../common/useHubConfig';
import { useHubView } from '../common/useHubView';
import { isAccessDeniedError } from '../common/utils/errorUtils';
import { HubRoute } from '../main/HubRoutes';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import {
  useEEPush,
  useExecutionEnvironmentsActions,
} from './hooks/useExecutionEnvironmentsActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const getPageUrl = useGetPageUrl();
  const eePush = useEEPush();
  const config = useHubConfig();
  const docsUrl = useGetDocsUrl(config, 'hubExecutionEnvironments');

  const view = useHubView<ExecutionEnvironment>({
    url: hubAPI`/v3/plugin/execution-environments/repositories/`,
    keyFn: idKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const allToolbarActions = useExecutionEnvironmentsActions(view.unselectItemsAndRefresh);
  const toolbarActions = useMemo(
    () => filterInsightsBulkActions(allToolbarActions),
    [allToolbarActions]
  );
  const rowActions = useExecutionEnvironmentActions(view.unselectItemsAndRefresh);

  // Check if the error is a 403 access denied error
  const isUnauthorized = isAccessDeniedError(view.error);

  const description = t(
    'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
  );

  return (
    <PageLayoutWithUnauthorized
      isUnauthorized={isUnauthorized}
      resourceName={t('Execution Environments')}
      title={t('Execution Environments')}
      titleHelpTitle={t('Execution Environments')}
      titleHelp={description}
      description={description}
      titleDocLink={docsUrl}
    >
      <PageTable<ExecutionEnvironment>
        id="hub-execution-environments-table"
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        rowActions={rowActions}
        errorStateTitle={t('Error loading execution environments')}
        emptyState={
          <PageTableEmptyState
            title={t('No execution environments yet')}
            description={t('To get started, create an execution environment.')}
          >
            <Flex alignItems={{ default: 'alignItemsCenter' }}>
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(HubRoute.CreateExecutionEnvironment)}
                data-cy="create-execution-environment"
                data-testid="create-execution-environment"
              >
                {t('Create execution environment')}
              </ButtonLink>
              <Button variant={ButtonVariant.link} onClick={() => eePush()}>
                {t('Push container images')}
              </Button>
            </Flex>
          </PageTableEmptyState>
        }
        {...view}
      />
    </PageLayoutWithUnauthorized>
  );
}
