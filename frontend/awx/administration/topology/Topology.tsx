import { useTranslation } from 'react-i18next';
import { PageHeader, PageLayout } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxConfig } from '../../common/useAwxConfig';
import { getDocsBaseUrl } from '../../common/util/getDocsBaseUrl';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { TopologyViewLayer } from './Visualizer';

export function Topology() {
  const { t } = useTranslation();
  const config = useAwxConfig();
  const { data } = useGet<MeshVisualizer>(awxAPI`/mesh_visualizer/`);

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
        titleDocLink={`${getDocsBaseUrl(config)}/html/administration/topology_viewer.html`}
      />
      {data && <TopologyViewLayer mesh={data} />}
    </PageLayout>
  );
}
