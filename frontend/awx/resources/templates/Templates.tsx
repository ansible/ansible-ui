import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { usePersistentFilters } from '../../../common/PersistentFilters';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { awxAPI } from '../../common/api/awx-utils';
import { TemplatesList } from './TemplatesList';
import { ActivityStreamIcon } from '../../common/ActivityStreamIcon';

export function Templates() {
  const { t } = useTranslation();

  usePersistentFilters('templates');
  const config = useAwxConfig();

  return (
    <PageLayout>
      <PageHeader
        title={t('Templates')}
        titleHelpTitle={t('Templates')}
        titleHelp={t(
          'A job template is a definition and set of parameters for running an Ansible job. Job templates are useful to execute the same job many times. Job templates also encourage the reuse of Ansible playbook content and collaboration between teams.'
        )}
        titleDocLink={`${getDocsBaseUrl(config)}/html/userguide/job_templates.html`}
        description={t(
          'A job template is a definition and set of parameters for running an Ansible job.'
        )}
        headerActions={
          <ActivityStreamIcon
            type={'job_template+workflow_job_template+workflow_job_template_node'}
          />
        }
      />
      <TemplatesList url={awxAPI`/unified_job_templates/`} />
    </PageLayout>
  );
}
