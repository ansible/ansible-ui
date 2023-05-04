import { PlusCircleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  PageTable,
  useColumnsWithoutExpandedRow,
  useColumnsWithoutSort,
  useVisibleModalColumns,
} from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { RouteObj } from '../../../Routes';
import { IEdaView } from '../../useEventDrivenView';
import { EdaRuleAudit } from '../../interfaces/EdaRuleAudit';
import { useRuleAuditColumns } from '../../views/RuleAudit/hooks/useRuleAuditColumns';

export function EdaRuleAuditCard(props: { view: IEdaView<EdaRuleAudit> }) {
  const { view } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const tableColumns = useRuleAuditColumns();
  let columns = useVisibleModalColumns(tableColumns);
  columns = useColumnsWithoutSort(columns);
  columns = useColumnsWithoutExpandedRow(columns);
  return (
    <PageDashboardCard
      title={t('Rule audit')}
      subtitle={t('Recently fired rules')}
      height="md"
      linkText={t('Go to Rule Audit')}
      to={RouteObj.EdaRuleAudit}
      helpTitle={t('Rule audit')}
      help={t('Rules that have been fired recently.')}
    >
      <PageTable
        disableBodyPadding={true}
        tableColumns={columns}
        autoHidePagination={true}
        errorStateTitle={t('Error loading rule audit records')}
        emptyStateIcon={PlusCircleIcon}
        emptyStateButtonIcon={<PlusCircleIcon />}
        emptyStateVariant={'light'}
        emptyStateTitle={t('There are currently no rule audit records')}
        {...view}
        compact
        itemCount={view.itemCount !== undefined ? Math.min(view.itemCount, 7) : undefined}
        pageItems={view.pageItems ? view.pageItems.slice(0, 7) : undefined}
        disableLastRowBorder
      />
    </PageDashboardCard>
  );
}
