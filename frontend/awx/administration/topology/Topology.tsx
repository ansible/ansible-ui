import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { EmptyStateError } from '@ansible/ansible-ui-framework/components/EmptyStateError';
import { EmptyStateUnauthorized } from '@ansible/ansible-ui-framework/components/EmptyStateUnauthorized';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { useGetDocsUrl } from '../../common/util/useGetDocsUrl';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { TopologyViewLayer } from './Visualizer';

export function Topology() {
  const { t } = useTranslation();
  const config = useAwxConfig();

  const { data, error } = useGet<MeshVisualizer>(awxAPI`/mesh_visualizer/`, undefined, {
    errorRetryCount: 0,
  });

  const isUnauthorized = (error as Error & { statusCode?: number })?.statusCode === 403;

  return (
    <PageLayout>
      <PageHeader
        title={t('Topology View')}
        description={t(
          'View node type, node health, and specific details about each node in your mesh topology.'
        )}
        titleHelpTitle={t('Topology View')}
        titleHelp={t(
          'View node type, node health, and specific details about each node in your mesh topology.'
        )}
        titleDocLink={useGetDocsUrl(config, 'topology')}
      />
      {isUnauthorized ? (
        <EmptyStateUnauthorized title={t('You do not have permission to perform this action.')} />
      ) : error ? (
        <EmptyStateError />
      ) : (
        data && <TopologyViewLayer mesh={data} />
      )}
    </PageLayout>
  );
}
