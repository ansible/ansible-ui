import { PageTable, useDashboardColumns, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageDashboardCard } from '@ansible/ansible-ui-framework/PageDashboard/PageDashboardCard';
import { PageTableEmptyState } from '@ansible/ansible-ui-framework/PageTable/PageTableEmptyState';
import { ButtonLink } from '@ansible/ansible-ui-framework/components/ButtonLink';
import { ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { edaAPI } from '../../common/eda-utils';
import { useEdaView } from '../../common/useEventDrivenView';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { EdaRoute } from '../../main/EdaRoutes';
import { useRulebookActivationColumns } from '../../rulebook-activations/hooks/useRulebookActivationColumns';

export function EdaRulebookActivationsCard() {
  const view = useEdaView<EdaRulebookActivation>({
    url: edaAPI`/activations/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });

  const { t } = useTranslation();
  const getPageUrl = useGetPageUrl();
  let columns = useRulebookActivationColumns();
  columns = useDashboardColumns(columns);
  return (
    <PageDashboardCard
      title={t('Rulebook Activations')}
      subtitle={t('Recently updated rulebook activations')}
      height="md"
      linkText={t('View all Rulebook Activations')}
      to={getPageUrl(EdaRoute.RulebookActivations)}
      helpTitle={t('Rulebook Activations')}
      help={t(
        'Rulebook activations manage the configuration and enabling of rulebooks that govern automation logic triggered by events.'
      )}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading activations')}
        emptyState={
          <PageTableEmptyState
            title={t('There are currently no rulebook activations')}
            description={t('Create a rulebook activation by clicking the button below.')}
          >
            <ButtonLink
              icon={<PlusCircleIcon />}
              variant={ButtonVariant.primary}
              href={getPageUrl(EdaRoute.CreateRulebookActivation)}
            >
              {t('Create rulebook activation')}
            </ButtonLink>
          </PageTableEmptyState>
        }
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
