import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import {
  useVisualizationController,
  TopologySideBar as PFTopologySideBar,
} from '@patternfly/react-topology';
import { Title } from '@patternfly/react-core';
import { WorkflowVisualizerNodeDetails } from '../WorkflowVisualizerNodeDetails';
import { NodeWizard } from './NodeWizard';
import { useViewOptions } from '../ViewOptionsProvider';
import { useCloseSidebar } from '../hooks';
import type { WorkflowNode } from '../../../../interfaces/WorkflowNode';

const TopologySideBar = styled(PFTopologySideBar)`
  padding-top: 20px;
  padding-left: 20px;
  padding-bottom: 20px;
`;

export const Sidebar = () => {
  const { t } = useTranslation();
  const controller = useVisualizationController();
  const { sidebarMode } = useViewOptions();
  const { selectedIds } = controller.getState<{ selectedIds: string[] }>();
  const handleClose = useCloseSidebar();

  if (!sidebarMode) return null;

  const nodeSidebar = {
    add: {
      title: t('Add Node'),
      content: () => <NodeWizard mode="add" />,
    },
    edit: {
      title: t('Edit Node'),
      content: () => <NodeWizard mode="edit" />,
    },
    view: {
      title: t('Node details'),
      content: () => {
        const data = controller.getNodeById(selectedIds[0])?.getData() as {
          resource: WorkflowNode;
        };
        return <WorkflowVisualizerNodeDetails resource={data?.resource} />;
      },
    },
  };

  return (
    <TopologySideBar
      data-cy="workflow-topology-sidebar"
      header={<Title headingLevel="h1">{nodeSidebar[sidebarMode].title}</Title>}
      onClose={handleClose}
      resizable
      show
    >
      {nodeSidebar[sidebarMode]?.content()}
    </TopologySideBar>
  );
};
