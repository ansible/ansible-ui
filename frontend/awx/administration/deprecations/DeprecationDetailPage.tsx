import { PageHeader, PageLayout, useGetPageUrl } from '@ansible/ansible-ui-framework';
import { PageRoutedTabs } from '@ansible/common-ui/PageRoutedTabs';
import { Button } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AwxRoute } from '../../main/AwxRoutes';

const DEPRECATION_DOCS: Record<string, string> = {
  'with_items on module':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html',
  'Bare variables in conditionals':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_conditionals.html',
  'include directive':
    'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse.html',
  'with_dict loop': 'https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_loops.html',
  squash_actions: 'https://docs.ansible.com/ansible/latest/reference_appendices/config.html',
  hash_behaviour:
    'https://docs.ansible.com/ansible/latest/reference_appendices/config.html#default-hash-behaviour',
};

export function DeprecationDetailPage() {
  const { t } = useTranslation();
  const { deprecationType } = useParams<{ deprecationType: string }>();
  const getPageUrl = useGetPageUrl();
  const decodedType = decodeURIComponent(deprecationType ?? '');
  const docsUrl = DEPRECATION_DOCS[decodedType];

  return (
    <PageLayout>
      <PageHeader
        title={decodedType}
        breadcrumbs={[
          { label: t('Deprecations'), to: getPageUrl(AwxRoute.Deprecations) },
          { label: decodedType },
        ]}
        headerActions={
          docsUrl ? (
            <Button
              variant="link"
              component="a"
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
            >
              {t('Documentation')}
            </Button>
          ) : undefined
        }
      />
      <PageRoutedTabs
        backTab={{
          label: t('Back to Deprecations'),
          page: AwxRoute.Deprecations,
          persistentFilterKey: 'deprecations',
        }}
        tabs={[
          { label: t('Details'), page: AwxRoute.DeprecationDetails },
          { label: t('Affected Jobs'), page: AwxRoute.DeprecationAffectedJobs },
        ]}
        params={{ deprecationType: deprecationType ?? '' }}
      />
    </PageLayout>
  );
}
