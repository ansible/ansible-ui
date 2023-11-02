import { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RegionsIcon, AnsibeTowerIcon, EllipsisHIcon } from '@patternfly/react-icons';
import {
  action,
  ComponentFactory,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  DefaultEdge,
  DefaultGroup,
  DefaultNode,
  EdgeModel,
  EdgeStyle,
  GraphComponent,
  Model,
  ModelKind,
  NodeModel,
  NodeShape,
  NodeStatus,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologySideBar,
  TopologyView,
  Visualization,
  VisualizationProvider,
  VisualizationSurface,
  withSelection,
  withPanZoom,
} from '@patternfly/react-topology';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { InstanceDetailSidebar } from './Sidebar';
import { CustomEdgeProps, CustomNodeProps, WebWorkerResponse } from './types';

const baselineComponentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return withSelection()(CustomNode);
        case ModelKind.edge:
          return CustomEdge;
        default:
          return undefined;
      }
  }
};

const NODE_DIAMETER = 50;

function getNodeIcon(nodeType: string) {
  switch (nodeType) {
    case 'hybrid':
      return RegionsIcon;
    case 'execution':
      return AnsibeTowerIcon;
    case 'control':
      return RegionsIcon;
    case 'hop':
      return EllipsisHIcon;
    default:
      return AnsibeTowerIcon;
  }
}

const CustomNode: React.FC<CustomNodeProps> = ({
  element,
  onSelect,
  selected,
}: CustomNodeProps) => {
  const data = element.getData();
  const Icon = data && getNodeIcon(data.nodeType);

  return (
    <DefaultNode
      element={element}
      showStatusDecorator
      onSelect={onSelect}
      selected={selected}
      onStatusDecoratorClick={onSelect}
    >
      <g transform={`translate(13, 13)`}>
        {Icon && <Icon style={{ color: '#393F44' }} width={25} height={25} />}
      </g>
    </DefaultNode>
  );
};

function getNodeShape(nodeType: string) {
  switch (nodeType) {
    case 'control':
      return NodeShape.ellipse;
    case 'execution':
      return NodeShape.rect;
    case 'hybrid':
      return NodeShape.rhombus;
    case 'hop':
      return NodeShape.hexagon;
    default:
      return NodeShape.ellipse;
  }
}
function getNodeStatus(nodeState: string) {
  switch (nodeState) {
    case 'ready':
      return NodeStatus.success;
    case 'installed':
    case 'provisioning':
    case 'deprovisioning':
      return NodeStatus.default;
    case 'deprovision-fail':
    case 'provision-fail':
      return NodeStatus.danger;
    case 'unavailable':
      return NodeStatus.info;
    default:
      return NodeStatus.success;
  }
}
const CustomEdge: React.FC<CustomEdgeProps> = ({ element }: CustomEdgeProps) => {
  const data = element.getData();
  return <DefaultEdge element={element} {...data} />;
};
function getEdgeStyle(edge: string) {
  switch (edge) {
    case 'established':
      return EdgeStyle.default;
    case 'adding':
    case 'removing':
      return EdgeStyle.dashed;
    default:
      return EdgeStyle.default;
  }
}
function getEdgeStatus(edge: string) {
  switch (edge) {
    case 'established':
      return NodeStatus.success;
    case 'adding':
      return NodeStatus.info;
    case 'removing':
      return NodeStatus.warning;
    default:
      return NodeStatus.default;
  }
}

export const TopologyViewLayer = (props: { mesh: MeshVisualizer }) => {
  const { mesh } = props;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [meshLayout, setMeshLayout] = useState<WebWorkerResponse>({
    type: '',
    nodes: [],
    links: [],
  });
  const controllerRef = useRef<Visualization>();
  const controller = controllerRef.current;

  function handleMeshLayout(data: WebWorkerResponse) {
    setMeshLayout(() => ({ ...data }));
  }

  const getData: Worker = useMemo(() => new Worker(new URL('./worker.ts', import.meta.url)), []);
  function getWidth(selector: string) {
    const selected = d3.select(selector).node();
    return selected ? (selected as HTMLElement).getBoundingClientRect().width : 1200;
  }
  function getHeight(selector: string) {
    const selected = d3.select(selector).node();
    return selected ? (selected as HTMLElement).getBoundingClientRect().height : 800;
  }
  useEffect(() => {
    const width = getWidth('#mesh-topology');
    const height = getHeight('#mesh-topology');
    if (window.Worker) {
      getData.postMessage({
        nodes: mesh.nodes,
        links: mesh.links,
        width: width,
        height: height,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.Worker) {
      getData.onmessage = function handleWorkerEvent(event: { data: WebWorkerResponse }) {
        switch (event.data.type) {
          case 'tick':
            break;
          // TODO: replace with loading progress bar
          // return console.dir('tick', event.data);
          case 'end':
            return handleMeshLayout(event.data);
          default:
            return false;
        }
      };
    }
  }, [getData]);

  useEffect(() => {
    const model: Model = {
      nodes: [],
      edges: [],
      graph: {
        id: 'g1',
        type: 'graph',
      },
    };
    const newController = new Visualization();
    newController.registerComponentFactory(baselineComponentFactory);

    newController.addEventListener(SELECTION_EVENT, setSelectedIds);

    newController.fromModel(model, false);

    controllerRef.current = newController;
  }, []);

  useEffect(() => {
    const nodes: NodeModel[] = meshLayout.nodes.map((n) => {
      return {
        id: n.id,
        x: n.x,
        y: n.y,
        type: n.node_type,
        label: n.hostname,
        width: NODE_DIAMETER,
        height: NODE_DIAMETER,
        shape: getNodeShape(n.node_type),
        status: getNodeStatus(n.node_state),
        data: {
          nodeType: n.node_type,
        },
      };
    });
    const links: EdgeModel[] = meshLayout.links.map((l) => {
      return {
        id: `edge-${l.source.id}-${l.target.id}`,
        type: 'edge',
        source: l.source.id,
        target: l.target.id,
        edgeStyle: getEdgeStyle(l.link_state),
        data: {
          endTerminalStatus: getEdgeStatus(l.link_state),
          tagStatus: getEdgeStatus(l.link_state),
        },
      };
    });

    const model: Model = {
      nodes,
      edges: links,
    };
    if (!controller) {
      return;
    }
    controller.fromModel(model, true); // Merge in the changes
    controller.getGraph().fit(80);
  }, [meshLayout, controller]);

  if (!controller) {
    return null;
  }

  return (
    <TopologyView
      id="mesh-topology"
      sideBar={
        <TopologySideBar
          className="topology-example-sidebar"
          show={selectedIds.length > 0}
          onClose={() => setSelectedIds([])}
        >
          <InstanceDetailSidebar selectedId={selectedIds[0]}></InstanceDetailSidebar>
        </TopologySideBar>
      }
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
          })}
        />
      }
    >
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
    </TopologyView>
  );
};
