import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useRulebookActions } from './hooks/useRulebookActions';
import { useRulebookColumns } from './hooks/useRulebookColumns';
import { useRulebookFilters } from './hooks/useRulebookFilters';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

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

  const rowActions = useRulebookActions(undefined);
  return (
    <PageLayout>
      <PageHeader title={t('Rulebooks')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
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
