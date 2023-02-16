import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework';
import { useGet } from '../../common/useItem';
import { idKeyFn } from '../../hub/usePulpView';
import { RouteE } from '../../Routes';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useRulebookActions } from './hooks/useRulebookActions';
import { useRulebookColumns } from './hooks/useRulebookColumns';
import { useRulebookFilters } from './hooks/useRulebookFilters';
import { API_PREFIX } from '../constants';

export function Rulebooks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useRulebookFilters();
  const { data: rulebooks, mutate: refresh } = useGet<EdaRulebook[]>(`${API_PREFIX}/rulebooks/`);
  const tableColumns = useRulebookColumns();
  const view = useInMemoryView<EdaRulebook>({
    items: rulebooks,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  });

  const rowActions = useRulebookActions(undefined, refresh);
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
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Rulebook')}
      />
    </PageLayout>
  );
}
