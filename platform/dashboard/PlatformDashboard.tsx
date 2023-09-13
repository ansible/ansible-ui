import { useTranslation } from 'react-i18next';
import { PageDashboard, PageHeader, PageLayout } from '../../framework';

export function PlatformDashboard() {
  const { t } = useTranslation();
  return (
    <PageLayout>
      <PageHeader
        title={t(`Welcome to tha Ansible Automation Platform`)}
        description={t(
          'Empower, Automate, Connect: Unleash Possibilities with the Ansible Automation Platform.'
        )}
      />
      <PageDashboard></PageDashboard>
    </PageLayout>
  );
}
