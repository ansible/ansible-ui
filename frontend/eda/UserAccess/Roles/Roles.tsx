import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { EdaRole } from '../../interfaces/EdaRole';
import { useEdaView } from '../../useEventDrivenView';
import { useRoleColumns } from './hooks/useRoleColumns';
import { edaAPI } from '../../api/eda-utils';

export function Roles() {
  const { t } = useTranslation();
  const tableColumns = useRoleColumns(true);
  const view = useEdaView<EdaRole>({
    url: edaAPI`/roles/`,
    tableColumns,
  });
  return (
    <PageLayout>
      <PageHeader
        title={t('Roles')}
        description={t(
          'A role is a set of permissions that can be assigned to users based on their role within an organization.'
        )}
      />
      <PageTable
        id="eda-roles-table"
        tableColumns={tableColumns}
        errorStateTitle={t('Error loading roles')}
        emptyStateTitle={t('There are currently no roles added for your organization.')}
        {...view}
        defaultSubtitle={t('Roles')}
      />
    </PageLayout>
  );
}
