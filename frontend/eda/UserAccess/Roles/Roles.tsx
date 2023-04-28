import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { EdaRole } from '../../interfaces/EdaRole';
import { useRoleColumns } from './hooks/useRoleColumns';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Roles() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns();
  const view = useEdaView<EdaRole>({
    url: `${API_PREFIX}/roles/`,
    tableColumns,
  });
  return (
    <PageLayout>
      <PageHeader title={t('Roles')} />
      <PageTable
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('There are currently no roles added for your organization.')}
        {...view}
        defaultSubtitle={t('Roles')}
      />
    </PageLayout>
  );
}
