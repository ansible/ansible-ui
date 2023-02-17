import { useTranslation } from 'react-i18next';
import {
  PageHeader,
  PageLayout,
  PageTab,
  PageTable,
  PageTabs,
  useInMemoryView,
} from '../../../../framework';
import { useGet } from '../../../common/useItem';
import { EdaAction } from '../../interfaces/EdaAction';
import { useActionsColumns } from './hooks/useActionsColumns';
import { useActionsFilters } from './hooks/useActionsFilters';
import { useHostsFilters } from './hooks/useHostsFilters';
import { EdaHost } from '../../interfaces/EdaHost';
import { useHostsColumns } from './hooks/useHostsColumns';
import { API_PREFIX } from '../../constants';

const actionsRulesEndpoint = `${API_PREFIX}/audit/rules_fired/`;
const actionsHostsEndpoint = `${API_PREFIX}/audit/hosts_changed/`;

export function Actions() {
  const { t } = useTranslation();
  const useFetchHosts = () => useGet<EdaHost[]>(actionsHostsEndpoint);
  const useFetchRecentActions = () => useGet<EdaAction[]>(actionsRulesEndpoint);

  function ActionsTab() {
    const { t } = useTranslation();
    const toolbarFilters = useActionsFilters();
    const { data: actions } = useFetchRecentActions();
    const tableColumns = useActionsColumns();
    const view = useInMemoryView<EdaAction>({
      items: actions,
      tableColumns,
      toolbarFilters,
      keyFn: (item) => item?.rule?.id,
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
    const { data: hosts } = useFetchHosts();
    const tableColumns = useHostsColumns();
    const view = useInMemoryView<EdaHost>({
      items: hosts,
      tableColumns,
      toolbarFilters,
      keyFn: (item) => item?.id,
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
