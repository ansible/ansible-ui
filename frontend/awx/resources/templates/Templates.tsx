import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { usePersistentFilters } from '@ansible/common-ui/PersistentFilters';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { useTranslation } from 'react-i18next';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';
import { awxAPI } from '../../common/api/awx-utils';
import { Domains } from '../../common/domains/Domains';
import { useAwxConfig } from '../../common/useAwxConfig';
import { TemplatesList } from './TemplatesList';

export function Templates() {
  const { t } = useTranslation();
  usePersistentFilters('templates');
  const config = useAwxConfig();
  return (
    <PageLayout>
      <PageHeader
        title={t('Automation Templates')}
        titleHelpTitle={t('Automation Templates')}
        titleHelp={[
          t(
            'Automation Templates serve as a powerful blueprint for automating and orchestrating complex IT tasks.'
          ),
          t(
            'Whether defined as a Job Template or Workflow Template, it standardizes and streamlines routine operations, enabling consistent execution across various environments.'
          ),
          t(
            'By specifying playbooks, inventory, credentials, and other configuration details, an Automation Template eliminates manual intervention, reduces errors, and accelerates task completion.'
          ),
          t(
            'It also provides flexibility by allowing the chaining of multiple tasks in a Workflow Template, supporting sophisticated automation use cases that can span across multiple systems and processes.'
          ),
          t(
            'This ensures IT teams can reliably scale automation while maintaining high efficiency and control.'
          ),
        ]}
        titleDocLink={useGetDocsUrl(config, 'templates')}
        description={t(
          'Job Templates and Workflow Templates for automating and orchestrating IT tasks efficiently.'
        )}
        headerActions={
          <ActivityStreamIcon
            type={'job_template+workflow_job_template+workflow_job_template_node'}
          />
        }
      />
      <Domains />
      <TemplatesList url={awxAPI`/unified_job_templates/`} />
    </PageLayout>
  );
}
