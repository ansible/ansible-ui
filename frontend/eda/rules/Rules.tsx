import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../framework';
import { RouteObj } from '../../Routes';
import { API_PREFIX } from '../constants';
import { EdaRule } from '../interfaces/EdaRule';
import { useEdaView } from '../useEventDrivenView';
import { useRuleColumns } from './hooks/useRuleColumns';
import { useRuleFilters } from './hooks/useRuleFilters';

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
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaProject)}
        {...view}
        defaultSubtitle={t('Rule')}
      />
    </PageLayout>
  );
}
