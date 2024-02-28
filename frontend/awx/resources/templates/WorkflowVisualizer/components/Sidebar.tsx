import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { TopologySideBar as PFTopologySideBar } from '@patternfly/react-topology';
import { useViewOptions } from '../ViewOptionsProvider';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';
import { NodeAddWizard } from '../wizard/NodeAddWizard';
import { NodeEditWizard } from '../wizard/NodeEditWizard';
import { useSelectedNode } from '../hooks';

const TopologySideBar = styled(PFTopologySideBar)`
  display: flex;
  flex-direction: column;
`;

export function Sidebar() {
  const { t } = useTranslation();
  const selectedNode = useSelectedNode();
  const { sidebarMode } = useViewOptions();

  if (!sidebarMode) return null;

  const nodeSidebar = {
    add: <NodeAddWizard />,
    edit: selectedNode && <NodeEditWizard node={selectedNode} />,
    view: selectedNode && <WorkflowVisualizerNodeDetails node={selectedNode} />,
  };

  return (
    <TopologySideBar
      aria-label={t('Topology sidebar')}
      data-cy="workflow-topology-sidebar"
      resizable
      show
    >
      {nodeSidebar[sidebarMode]}
    </TopologySideBar>
  );
}
