import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { useTranslation } from 'react-i18next';
import { DeprecationsDashboard } from './DeprecationsDashboard';

export function Deprecations() {
  const { t } = useTranslation();

  return (
    <PageLayout>
      <PageHeader
        title={t('Deprecations')}
        titleHelpTitle={t('Deprecations')}
        titleHelp={t(
          'Monitor and track Ansible deprecation warnings across your automation estate. This helps you identify and fix deprecated patterns before upgrading to newer versions of Ansible Core.'
        )}
        description={t(
          'View deprecation warnings from job executions to proactively address compatibility issues.'
        )}
      />
      <DeprecationsDashboard />
    </PageLayout>
  );
}
