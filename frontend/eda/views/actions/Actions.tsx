import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTab, PageTable, PageTabs } from '../../../../framework';
import { EdaAction } from '../../interfaces/EdaAction';
import { useActionsColumns } from './hooks/useActionsColumns';
import { useActionsFilters } from './hooks/useActionsFilters';
import { useHostsFilters } from './hooks/useHostsFilters';
import { EdaHost } from '../../interfaces/EdaHost';
import { useHostsColumns } from './hooks/useHostsColumns';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

const actionsRulesEndpoint = `${API_PREFIX}/audit/rules_fired/`;
const actionsHostsEndpoint = `${API_PREFIX}/audit/hosts_changed/`;

export function Actions() {
  const { t } = useTranslation();

  function ActionsTab() {
    const { t } = useTranslation();
    const toolbarFilters = useActionsFilters();
    const tableColumns = useActionsColumns();
    const view = useEdaView<EdaAction>({
      url: actionsRulesEndpoint,
      toolbarFilters,
      tableColumns,
    });

    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading recent actions')}
          emptyStateTitle={t('No actions')}
          emptyStateDescription={t('No recent actions')}
          {...view}
          defaultSubtitle={t('Recent actions')}
        />
      </PageLayout>
    );
  }

  function HostsTab() {
    const { t } = useTranslation();
    const toolbarFilters = useHostsFilters();
    const tableColumns = useHostsColumns();
    const view = useEdaView<EdaHost>({
      url: actionsHostsEndpoint,
      toolbarFilters,
      tableColumns,
    });

    return (
      <PageLayout>
        <PageTable
          tableColumns={tableColumns}
          toolbarFilters={toolbarFilters}
          errorStateTitle={t('Error loading recently changed hosts')}
          emptyStateTitle={t('No recently changed hosts')}
          emptyStateDescription={t('No recently changed hosts')}
          {...view}
          defaultSubtitle={t('Recently changed hosts')}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader title={`Actions`} />
      <PageTabs>
        <PageTab label={t('Recent actions')}>
          <ActionsTab />
        </PageTab>
        <PageTab label={t('Hosts recently changed')}>
          <HostsTab />
        </PageTab>
      </PageTabs>
    </PageLayout>
  );
}
