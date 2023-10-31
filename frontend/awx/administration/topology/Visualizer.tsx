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
  GraphElement,
  ElementModel,
} from '@patternfly/react-topology';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { InstanceDetailSidebar } from './Sidebar';
export interface MeshNode {
  id: string;
  x: number;
  y: number;
  node_type: string;
  hostname: string;
  node_state: string;
}

export interface MeshLink {
  source: {
    id: string;
    hostname: string;
  };
  target: {
    id: string;
    hostname: string;
  };
}

interface WebWorkerResponse {
  type: string;
  nodes: MeshNode[];
  links: MeshLink[];
}

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
          return withSelection()(DefaultEdge);
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

const CustomNode = (props: {
  element: GraphElement<ElementModel, { nodeType: string }>;
  onSelect: (e: React.MouseEvent) => void;
  selected: boolean;
}) => {
  const { element, onSelect, selected } = props;
  const data = element.getData();
  const Icon = data && getNodeIcon(data.nodeType);

  return (
    <DefaultNode element={element} showStatusDecorator onSelect={onSelect} selected={selected}>
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
      return NodeStatus.danger;
    case 'provision-fail':
      return NodeStatus.info;
    case 'unavailable':
      return NodeStatus.info;
    default:
      return NodeStatus.success;
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
        edgeStyle: EdgeStyle.default,
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
          <InstanceDetailSidebar selectedId={parseInt(selectedIds[0])}></InstanceDetailSidebar>
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
