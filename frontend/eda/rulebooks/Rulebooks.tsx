import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { EdaRoute } from '../EdaRoutes';
import { API_PREFIX } from '../constants';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useEdaView } from '../useEventDrivenView';
import { useRulebookColumns } from './hooks/useRulebookColumns';
import { useRulebookFilters } from './hooks/useRulebookFilters';

export function Rulebooks() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useRulebookFilters();
  const tableColumns = useRulebookColumns();
  const view = useEdaView<EdaRulebook>({
    url: `${API_PREFIX}/rulebooks/`,
    toolbarFilters,
    tableColumns,
  });

  return (
    <PageLayout>
      <PageHeader title={t('Rulebooks')} />
      <PageTable
        id="eda-rulebooks-table"
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading rulebooks')}
        emptyStateTitle={t('No rulebooks yet')}
        emptyStateDescription={t('Please add a project by using the button below')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateProject)}
        {...view}
        defaultSubtitle={t('Rulebook')}
      />
    </PageLayout>
  );
}
