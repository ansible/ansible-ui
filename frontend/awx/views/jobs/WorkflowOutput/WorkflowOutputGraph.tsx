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
import { WorkflowNode } from '../../../interfaces/WorkflowNode';
import { useTranslation } from 'react-i18next';
import { secondsToHHMMSS } from '../../../../../framework/utils/dateTimeHelpers';
import { Job } from '../../../interfaces/Job';
import { useGet } from '../../../../common/crud/useGet';

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

    const nodeId = message?.workflow_node_id?.toString();

    const { data: newNode } = useGet<WorkflowNode>(
      nodeId ? awxAPI`/workflow_job_nodes/${nodeId}/` : '',
      undefined,
      { refreshInterval: 1000 }
    );

    const node = controller.getNodeById(message?.workflow_node_id?.toString() || '');
    const { refreshNodeStatus } = props;
    useEffect(() => {
      const getElapsedTime = (nodeId: number) => {
        if (!props.job || !nodeId) return;

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

      if (message?.unified_job_id && message.unified_job_id !== props.job?.id) {
        if (node) {
          const { resource } = node.getData() as { resource: WorkflowNode };
          action(() => {
            node.setData({
              ...node.getData(),
              resource: {
                ...resource,
                summary_fields: {
                  ...resource.summary_fields,
                  job: {
                    ...resource.summary_fields.job,
                    id: message.unified_job_id,
                    type: message.type,
                  },
                },
              },
            });
          })();
        }
      }

      if (message.finished) {
        void getElapsedTime(message.workflow_node_id);
      }

      action(() => {
        node?.setNodeStatus(message.status as NodeStatus);
      })();
    }, [node, message, props.job, t, nodes, newNode]);

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
