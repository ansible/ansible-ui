import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { useInMemoryView } from '../../../framework/useInMemoryView';
import { useGet } from '../../common/useItem';
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';
import { useRulebookActivationFilters } from './hooks/useRulebookActivationFilters';
import { useRulebookActivationsActions } from './hooks/useRulebookActivationsActions';

export function RulebookActivations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useRulebookActivationFilters();
  const { data: rulebookActivations, mutate: refresh } =
    useGet<EdaRulebookActivation[]>('/api/activations');
  const tableColumns = useRulebookActivationColumns();
  const view = useInMemoryView<EdaRulebookActivation>({
    items: rulebookActivations,
    tableColumns,
    toolbarFilters,
    keyFn: (item) => item?.id,
  });
  const toolbarActions = useRulebookActivationsActions(refresh);
  const rowActions = useRulebookActivationActions(refresh);
  return (
    <PageLayout>
      <PageHeader title={t('Rulebook activations')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading rulebook activations')}
        emptyStateTitle={t('No rulebook activations yet')}
        emptyStateDescription={t('To get started, create a rulebook activation.')}
        emptyStateButtonText={t('Create rulebook activation')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaRulebookActivation)}
        {...view}
        defaultSubtitle={t('Rulebook activation')}
      />
    </PageLayout>
  );
}
