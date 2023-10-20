import * as React from 'react';
import {
  ComponentFactory,
  Controller,
  DefaultNode,
  Graph,
  GraphComponent,
  graphDropTargetSpec,
  Layout,
  Model,
  ModelKind,
  Node,
  NodeModel,
  NodeShape,
  nodeDragSourceSpec,
  nodeDropTargetSpec,
  PipelineDagreLayout,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  WithDndDropProps,
  WithDragNodeProps,
  withDndDrop,
  withDragNode,
  withPanZoom,
  WithSelectionProps,
} from '@patternfly/react-topology';
import { ClipboardCheckIcon } from '@patternfly/react-icons';
import type { WorkflowNode } from '../../../interfaces/WorkflowNode';
import type { AwxItemsResponse } from '../../../common/AwxItemsResponse';

const NODE_DIAMETER = 75;
type CustomNodeProps = {
  element: Node;
} & WithDragNodeProps;
const CustomNode: React.FunctionComponent<
  CustomNodeProps & WithSelectionProps & WithDragNodeProps & WithDndDropProps
> = ({ element }) => {
  return (
    <DefaultNode element={element}>
      <g transform={`translate(25, 25)`}>
        <ClipboardCheckIcon style={{ fill: '#000' }} width={25} height={25} />
      </g>
    </DefaultNode>
  );
};

const CONNECTOR_TARGET_DROP = 'connector-target-drop';
const pipelineComponentFactory = (kind: ModelKind, type: string) => {
  if (kind === ModelKind.graph) {
    return withDndDrop(graphDropTargetSpec())(withPanZoom()(GraphComponent));
  }
  switch (type) {
    case ModelKind.node:
      return withDndDrop(nodeDropTargetSpec([CONNECTOR_TARGET_DROP]))(
        withDragNode(nodeDragSourceSpec('node', true, true))(CustomNode)
      );
    default:
      return undefined;
  }
};

type TopologyPipelineProps = {
  data: AwxItemsResponse<WorkflowNode>;
};
export const TopologyPipeline = (props: TopologyPipelineProps) => {
  const testNode = props.data.results[0];

  const controllerRef = React.useRef<Controller>();
  const controller = controllerRef.current;

  const [layout, setLayout] = React.useState<WorkflowNode[]>([]);

  React.useEffect(() => {
    return setLayout(() => [testNode]);
  }, [testNode]);

  React.useEffect(() => {
    const model: Model = {
      nodes: [],
      edges: [],
      graph: {
        id: 'g1',
        type: 'graph',
        layout: 'pipelineLayout',
      },
    };

    const newController = new Visualization();
    newController.setFitToScreenOnLayout(true);

    newController.registerComponentFactory(pipelineComponentFactory as ComponentFactory);
    newController.registerLayoutFactory(
      (type: string, graph: Graph): Layout | undefined => new PipelineDagreLayout(graph)
    );

    newController.fromModel(model, false);

    controllerRef.current = newController;
  }, []);

  React.useEffect(() => {
    const nodes: NodeModel[] = layout.map((n) => {
      const name = n.summary_fields?.unified_job_template?.name || 'no name';

      return {
        id: n.identifier,
        type: 'node',
        label: name,
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: NodeShape.ellipse,
      };
    });
    const model: Model = {
      edges: [],
      nodes,
    };

    if (!controller) {
      return;
    }

    controller.fromModel(model, true);
  }, [layout, controller]);

  if (!controller) {
    return null;
  }
  return (
    <VisualizationProvider controller={controller}>
      <VisualizationSurface />
    </VisualizationProvider>
  );
};
