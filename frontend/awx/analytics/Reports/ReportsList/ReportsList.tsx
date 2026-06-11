import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { ReportCard } from './ReportCard';

export function ReportsList() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <PageHeader
        title={t('Reports')}
        description={t('View various reports to gain insights into your automations.')}
        titleHelpTitle={t('Reports')}
        titleHelp={t('View various reports to gain insights into your automations.')}
      />
      <ReportCard />
    </PageLayout>
  );
}
