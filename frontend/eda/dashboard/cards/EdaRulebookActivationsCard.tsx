import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useGetPageUrl,
  usePageNavigate,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { EdaRoute } from '../../EdaRoutes';
import { edaAPI } from '../../api/eda-utils';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from '../../rulebook-activations/hooks/useRulebookActivationColumns';
import { useEdaView } from '../../useEventDrivenView';

export function EdaRulebookActivationsCard() {
  const view = useEdaView<EdaRulebookActivation>({
    url: edaAPI`/activations/`,
    queryParams: { page: '1', page_size: '10' },
    disableQueryString: true,
  });

  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const tableColumns = useRulebookActivationColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useMemo(() => columns, [columns]);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);
  return (
    <PageDashboardCard
      title={t('Rulebook Activations')}
      subtitle={t('Recently updated activations')}
      height="md"
      linkText={t('Go to Rulebook Activations')}
      to={getPageUrl(EdaRoute.RulebookActivations)}
      helpTitle={t('Rulebook activations')}
      help={t('Rulebook activations are rulebooks that have been activated to run.')}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading activations')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no rulebook activations')}
        emptyStateDescription={t('Create a rulebook activation by clicking the button below.')}
        emptyStateButtonText={t('Create rulebook activation')}
        emptyStateButtonClick={() => pageNavigate(EdaRoute.CreateRulebookActivation)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
