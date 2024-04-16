import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable, usePageNavigate } from '../../../framework';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../main/EdaRoutes';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';
import { useRulebookActivationFilters } from './hooks/useRulebookActivationFilters';
import { useRulebookActivationsActions } from './hooks/useRulebookActivationsActions';
import { PlusCircleIcon } from '@patternfly/react-icons';

export function RulebookActivations() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useRulebookActivationFilters();
  const tableColumns = useRulebookActivationColumns();
  const view = useEdaView<EdaRulebookActivation>({
    url: edaAPI`/activations/`,
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
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={t('Create rulebook activation')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateRulebookActivation)}
        {...view}
        defaultSubtitle={t('Rulebook Activation')}
      />
    </PageLayout>
  );
}
