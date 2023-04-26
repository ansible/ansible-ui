import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, PageLayout, PageTable } from '../../../../framework';
import { RouteObj } from '../../../Routes';
import { EdaRole } from '../../interfaces/EdaRole';
import { useRoleColumns } from './hooks/useRoleColumns';
import { API_PREFIX } from '../../constants';
import { useEdaView } from '../../useEventDrivenView';

export function Roles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        emptyStateTitle={t('No roles yet')}
        emptyStateDescription={t('To get started, create a role.')}
        emptyStateButtonText={t('Create role')}
        emptyStateButtonClick={() => navigate(RouteObj.CreateEdaRole)}
        {...view}
        defaultSubtitle={t('Role')}
      />
    </PageLayout>
  );
}
