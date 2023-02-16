import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteE } from '../../Routes';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';
import { useRulebookActivationFilters } from './hooks/useRulebookActivationFilters';
import { useRulebookActivationsActions } from './hooks/useRulebookActivationsActions';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

export function RulebookActivations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
