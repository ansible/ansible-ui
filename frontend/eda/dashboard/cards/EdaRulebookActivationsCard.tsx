import { PlusCircleIcon } from '@patternfly/react-icons';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useGetPageUrl,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../common/Routes';
import { EdaRoute } from '../../EdaRoutes';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { useRulebookActivationColumns } from '../../rulebook-activations/hooks/useRulebookActivationColumns';
import { IEdaView } from '../../useEventDrivenView';

export function EdaRulebookActivationsCard(props: { view: IEdaView<EdaRulebookActivation> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaRulebookActivation)}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
