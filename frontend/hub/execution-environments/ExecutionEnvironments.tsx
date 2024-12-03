import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { idKeyFn } from '@ansible/common-ui/utils/nameKeyFn';
import { Button, ButtonVariant, Flex } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { hubAPI } from '../common/api/formatPath';
import { useHubView } from '../common/useHubView';
import { HubRoute } from '../main/HubRoutes';
import { ExecutionEnvironment } from './ExecutionEnvironment';
import { useExecutionEnvironmentActions } from './hooks/useExecutionEnvironmentActions';
import { useExecutionEnvironmentFilters } from './hooks/useExecutionEnvironmentFilters';
import {
  useEEPush,
  useExecutionEnvironmentsActions,
} from './hooks/useExecutionEnvironmentsActions';
import { useExecutionEnvironmentsColumns } from './hooks/useExecutionEnvironmentsColumns';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useHubConfig } from '../common/useHubConfig';

export function ExecutionEnvironments() {
  const { t } = useTranslation();
  const toolbarFilters = useExecutionEnvironmentFilters();
  const tableColumns = useExecutionEnvironmentsColumns();
  const getPageUrl = useGetPageUrl();
  const eePush = useEEPush();
  const config = useHubConfig();

  const view = useHubView<ExecutionEnvironment>({
    url: hubAPI`/v3/plugin/execution-environments/repositories/`,
    keyFn: idKeyFn,
    toolbarFilters,
    tableColumns,
  });

  const toolbarActions = useExecutionEnvironmentsActions(view.unselectItemsAndRefresh);
  const rowActions = useExecutionEnvironmentActions(view.unselectItemsAndRefresh);

  return (
    <PageLayout>
      <PageHeader
        title={t('Execution Environments')}
        titleHelpTitle={t('Execution Environments')}
        titleHelp={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
        description={t(
          'Execution environments are isolated and reproducible environments that provide consistent runtime environments for running Ansible playbooks and roles.'
        )}
        titleDocLink={useGetDocsUrl(config, 'hubExecutionEnvironments')}
      />

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
    </PageLayout>
  );
}
