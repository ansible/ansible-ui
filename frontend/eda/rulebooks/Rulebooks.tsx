import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { TablePage } from '../../../framework';
import { useInMemoryView } from '../../../framework/useInMemoryView';
import { useGet } from '../../common/useItem';
import { idKeyFn } from '../../hub/usePulpView';
import { RouteE } from '../../Routes';
import { EdaRulebook } from '../interfaces/EdaRulebook';
import { useRulebookActions } from './hooks/useRulebookActions';
import { useRulebookColumns } from './hooks/useRulebookColumns';
import { useRulebookFilters } from './hooks/useRulebookFilters';
import { useRulebooksActions } from './hooks/useRulebooksActions';

export function Rulebooks() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useRulebookFilters();
  const { data: rulebooks, mutate: refresh } = useGet<EdaRulebook[]>('/api/rulebooks');
  const tableColumns = useRulebookColumns();
  const view = useInMemoryView<EdaRulebook>({
    items: rulebooks,
    tableColumns,
    toolbarFilters,
    keyFn: idKeyFn,
  });
  const toolbarActions = useRulebooksActions(refresh);
  const rowActions = useRulebookActions(refresh);
  return (
    <TablePage
      title={t('Rulebooks')}
      tableColumns={tableColumns}
      toolbarActions={toolbarActions}
      toolbarFilters={toolbarFilters}
      rowActions={rowActions}
      errorStateTitle={t('Error loading rulebooks')}
      emptyStateTitle={t('No rulebooks yet')}
      emptyStateDescription={t('To get started, create a rulebook.')}
      emptyStateButtonText={t('Create rulebook')}
      emptyStateButtonClick={() => navigate(RouteE.CreateEdaRulebook)}
      {...view}
      defaultSubtitle={t('Rulebook')}
    />
  );
}
