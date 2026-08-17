import { PageDetails } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { EmptyStateError } from '@ansible/ansible-ui-framework/components/EmptyStateError';
import { EmptyStateNoData } from '@ansible/ansible-ui-framework/components/EmptyStateNoData';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { awxAPI } from '../../../common/api/awx-utils';
import { useGetHost } from '../../hosts/hooks/useGetHost';

export function InventoryHostFacts(props: { page: string }) {
  const { t } = useTranslation();
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  const hostId = props.page === 'host' ? (params.id ?? '') : (params.host_id ?? '');
  const { host } = useGetHost(hostId);
  const isConstructed = host?.summary_fields?.inventory?.kind === 'constructed';

  const hostLoaded = host !== undefined;
  const skipFacts = hostLoaded && isConstructed;
  const {
    data: facts,
    error,
    isLoading,
  } = useGet<object>(skipFacts ? undefined : awxAPI`/hosts/${hostId}/ansible_facts/`);

  if (isConstructed) {
    return (
      <EmptyStateNoData
        title={t('No facts available')}
        description={t(
          'Facts for hosts in constructed and smart inventories are stored on the source inventory host.'
        )}
      />
    );
  }

  if (error) {
    return <EmptyStateError message={error.message} />;
  }

  if (!isLoading && (!facts || Object.keys(facts).length === 0)) {
    return (
      <EmptyStateNoData
        title={t('No facts found')}
        description={t(
          'Facts are collected when a playbook with fact gathering enabled runs against this host.'
        )}
      />
    );
  }

  return (
    <PageDetails>
      <PageDetailCodeEditor label={t('Facts')} value={JSON.stringify(facts) ?? '{}'} />
    </PageDetails>
  );
}
