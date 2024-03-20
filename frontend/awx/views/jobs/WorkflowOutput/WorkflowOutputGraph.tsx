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
import { useWorkflowOutput } from './hooks/useWorkflowOutput';
import { useEffect } from 'react';
import styled from 'styled-components';
import { awxAPI } from '../../../common/api/awx-utils';
import { requestGet } from '../../../../common/crud/Data';
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { useTranslation } from 'react-i18next';
import { secondsToHHMMSS } from '../../../../../framework/utils/dateTimeHelpers';
import { Job } from '../../../interfaces/Job';

const TopologyView = styled(PFTopologyView)`
  .pf-v5-c-divider {
    display: none;
  }
`;
export const WorkflowOutputGraph = observer(
  (props: { job?: Job; reloadJob: () => void; refreshNodeStatus: () => void }) => {
    const controller = useVisualizationController();
    const { t } = useTranslation();
    const model = controller.toModel();
    const nodes = model.nodes;
    const message = useWorkflowOutput(props.reloadJob, props.job);
    const node = controller.getNodeById(message?.workflow_node_id?.toString() || '');
    const { refreshNodeStatus } = props;
    useEffect(() => {
      const getElapsedTime = async (nodeId: number) => {
        if (!props.job || !nodeId) return;

        const newNode: WorkflowNode | undefined = await requestGet<WorkflowNode>(
          awxAPI`/workflow_job_nodes/${nodeId.toString()}/`
        );

        node?.setData({
          ...node?.getData(),
          secondaryLabel: newNode
            ? t(`Elapsed time ${secondsToHHMMSS(newNode?.summary_fields?.job?.elapsed || 0)}`)
            : '',
        });
        return;
      };
      if (!message?.workflow_node_id || !message?.status || !nodes?.length) {
        return;
      }

      if (message.finished) {
        void getElapsedTime(message.workflow_node_id);
      }
      action(() => {
        node?.setNodeStatus(message.status as NodeStatus);
      })();
    }, [node, message, props.job, t, nodes]);

    useEffect(() => {
      refreshNodeStatus();
    }, [node, refreshNodeStatus]);
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
  }
);
