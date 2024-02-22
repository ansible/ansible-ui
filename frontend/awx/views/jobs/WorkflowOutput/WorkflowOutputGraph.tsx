import {
  TopologyControlBar,
  TopologyView as PFTopologyView,
  action,
  createTopologyControlButtons,
  useVisualizationController,
  defaultControlButtonsOptions,
  VisualizationSurface,
  NodeStatus,
  observer,
} from '@patternfly/react-topology';
import {
  ViewOptionsContext,
  ViewOptionsProvider,
} from '../../../resources/templates/WorkflowVisualizer/ViewOptionsProvider';
import { Legend } from '../../../resources/templates/WorkflowVisualizer/components';
import { useWorkflowOuput } from './hooks/useWorkflowOutput';
import { useEffect } from 'react';
import styled from 'styled-components';

const TopologyView = styled(PFTopologyView)`
  .pf-v5-c-divider {
    display: none;
  }
`;
export const WorkflowOutputGraph = observer((props: { jobId?: number }) => {
  const controller = useVisualizationController();
  const model = controller.toModel();
  const nodes = model.nodes;
  const message = useWorkflowOuput(props.jobId?.toString() as string);
  useEffect(() => {
    if (!message?.workflow_node_id || !message?.status || !nodes?.length) {
      return;
    }
    action(() => {
      controller
        .getNodeById(message?.workflow_node_id?.toString() || '')
        ?.setNodeStatus(message.status as NodeStatus);
    })();
  }, [controller, message, model, nodes]);
  return (
    <ViewOptionsProvider>
      <ViewOptionsContext.Consumer>
        {({ isLegendOpen, toggleLegend }) => {
          return (
            <TopologyView
              data-cy="workflow-visualizer-output-graph"
              controlBar={
                <TopologyControlBar
                  controlButtons={createTopologyControlButtons({
                    ...defaultControlButtonsOptions,
                    zoomInCallback: action(() => {
                      controller.getGraph().scaleBy(4 / 3);
                    }),
                    zoomOutCallback: action(() => {
                      controller.getGraph().scaleBy(0.75);
                    }),
                    fitToScreenCallback: action(() => {
                      controller.getGraph().fit(80);
                    }),
                    resetViewCallback: action(() => {
                      controller.getGraph().reset();
                      controller.getGraph().layout();
                    }),
                    legend: true,
                    legendCallback: toggleLegend,
                  })}
                />
              }
              sideBarOpen={false}
            >
              {isLegendOpen && <Legend />}
              <VisualizationSurface />
            </TopologyView>
          );
        }}
      </ViewOptionsContext.Consumer>
    </ViewOptionsProvider>
  );
});
