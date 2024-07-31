import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { TopologyViewLayer } from './Visualizer';
import { EmptyStateUnauthorized } from '../../../../framework/components/EmptyStateUnauthorized';
import { EmptyStateError } from '../../../../framework/components/EmptyStateError';

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
        titleHelpTitle={t('topology view')}
        titleHelp={t(
          'View node type, node health, and specific details about each node in your mesh topology.'
        )}
        titleDocLink={getDocsBaseUrl(config, 'topology')}
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
