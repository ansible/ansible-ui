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
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useOptions } from '../../common/crud/useOptions';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';

export function RulebookActivations() {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const toolbarFilters = useRulebookActivationFilters();
  const tableColumns = useRulebookActivationColumns();
  const { data } = useOptions<OptionsResponse<ActionsResponse>>(edaAPI`/activations/`);
  const canCreateActivations = Boolean(data && data.actions && data.actions['POST']);
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
        description={t(
          'Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.'
        )}
        titleHelpTitle={t('Rulebook Activations')}
        titleHelp={t(
          'Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.'
        )}
      />
      <PageTable
        id="eda-rulebook-activations-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading rulebook activations')}
        emptyStateTitle={
          canCreateActivations
            ? t('There are currently no rulebook activations created for your organization.')
            : t('You do not have permission to create a rulebook activation.')
        }
        emptyStateDescription={
          canCreateActivations
            ? t('Please create a rulebook activation by using the button below.')
            : t(
                'Please contact your organization administrator if there is an issue with your access.'
              )
        }
        emptyStateIcon={canCreateActivations ? undefined : CubesIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateButtonText={canCreateActivations ? t('Create rulebook activation') : undefined}
        emptyStateButtonClick={
          canCreateActivations ? () => pageNavigate(EdaRoute.CreateRulebookActivation) : undefined
        }
        {...view}
        defaultSubtitle={t('Rulebook Activation')}
      />
    </PageLayout>
  );
}
