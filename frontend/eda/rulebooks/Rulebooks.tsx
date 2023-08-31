import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../common/Routes';
import { API_PREFIX } from '../constants';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useEdaView } from '../useEventDrivenView';
import { useRulebookColumns } from './hooks/useRulebookColumns';
import { useRulebookFilters } from './hooks/useRulebookFilters';

export function Rulebooks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Rulebook')}
      />
    </PageLayout>
  );
}
