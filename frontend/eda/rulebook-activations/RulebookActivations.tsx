import { PageHeader, PageLayout, PageTable, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { useOptions } from '@ansible/common-ui/crud/useOptions';
import { ButtonVariant } from '@patternfly/react-core';
import { CubesIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../common/eda-utils';
import { useEdaView } from '../common/useEventDrivenView';
import { EdaRulebookActivation } from '../interfaces/EdaRulebookActivation';
import { ActionsResponse, OptionsResponse } from '../interfaces/OptionsResponse';
import { EdaRoute } from '../main/EdaRoutes';
import { useRulebookActivationActions } from './hooks/useRulebookActivationActions';
import { useRulebookActivationColumns } from './hooks/useRulebookActivationColumns';
import { useRulebookActivationFilters } from './hooks/useRulebookActivationFilters';
import { useRulebookActivationsActions } from './hooks/useRulebookActivationsActions';
import { useEdaConfig } from '../common/useEdaConfig';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';

export function RulebookActivations() {
  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
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
  const config = useEdaConfig();
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
        titleDocLink={useGetDocsUrl(config, 'rulebookActivations')}
      />
      <PageTable
        id="eda-rulebook-activations-table"
        tableColumns={tableColumns}
        toolbarActions={toolbarActions}
        toolbarFilters={toolbarFilters}
        rowActions={rowActions}
        errorStateTitle={t('Error loading rulebook activations')}
        emptyState={
          canCreateActivations ? (
            <PageTableEmptyState
              title={t(
                'There are currently no rulebook activations created for your organization.'
              )}
              description={t('Please create a rulebook activation by using the button below.')}
            >
              <ButtonLink
                icon={<PlusCircleIcon />}
                variant={ButtonVariant.primary}
                href={getPageUrl(EdaRoute.CreateRulebookActivation)}
              >
                {t('Create rulebook activation')}
              </ButtonLink>
            </PageTableEmptyState>
          ) : (
            <PageTableEmptyState
              icon={CubesIcon}
              title={t('You do not have permission to create a rulebook activation.')}
              description={t(
                'Please contact your organization administrator if there is an issue with your access.'
              )}
            />
          )
        }
        {...view}
        defaultSubtitle={t('Rulebook Activation')}
      />
    </PageLayout>
  );
}
