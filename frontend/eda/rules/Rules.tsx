import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { EdaRule } from '../interfaces/EdaRule';
import { useRuleColumns } from './hooks/useRuleColumns';
import { useRuleFilters } from './hooks/useRuleFilters';
import { RouteE } from '../../Routes';
import { API_PREFIX } from '../constants';
import { useEdaView } from '../useEventDrivenView';

export function Rules() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toolbarFilters = useRuleFilters();
  const tableColumns = useRuleColumns();
  const view = useEdaView<EdaRule>({
    url: `${API_PREFIX}/rules/`,
    tableColumns,
    toolbarFilters,
  });
  return (
    <PageLayout>
      <PageHeader title={t('Rules')} />
      <PageTable
        tableColumns={tableColumns}
        toolbarFilters={toolbarFilters}
        errorStateTitle={t('Error loading rules')}
        emptyStateTitle={t('No rules yet')}
        emptyStateDescription={t('Please add a project by using the button below')}
        emptyStateButtonText={t('Create project')}
        emptyStateButtonClick={() => navigate(RouteE.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Rules')}
      />
    </PageLayout>
  );
}
