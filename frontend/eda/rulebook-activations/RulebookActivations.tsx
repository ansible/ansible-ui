import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { EdaRoute } from '../EdaRoutes';
import { API_PREFIX } from '../constants';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useEdaView } from '../useEventDrivenView';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';
import { useRulebookActivationFilters } from './hooks/useRulebookActivationFilters';
import { useRulebookActivationsActions } from './hooks/useRulebookActivationsActions';

export function RulebookActivations() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useRulebookActivationFilters();
  const tableColumns = useRulebookActivationColumns();
  const view = useEdaView<EdaRulebookActivation>({
    url: `${API_PREFIX}/activations/`,
    toolbarFilters,
    tableColumns,
  });
  const toolbarActions = useRulebookActivationsActions(view);
  const rowActions = useRulebookActivationActions(view);
  return (
    <PageLayout>
      <PageHeader
        title={t('Rulebook Activations')}
        description={t('Rulebook activations are rulebooks that have been activated to run.')}
      />
      <PageTable
        id="eda-rulebook-activations-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading rulebook activations')}
        emptyStateTitle={t(
          'There are currently no rulebook activations created for your organization.'
        )}
        emptyStateDescription={t('Please create a rulebook activation by using the button below.')}
        emptyStateButtonText={t('Create rulebook activation')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateRulebookActivation)}
        {...view}
        defaultSubtitle={t('Rulebook Activation')}
      />
    </PageLayout>
  );
}
