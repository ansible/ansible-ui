import {
  ComponentFactory,
  DefaultGroup,
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
  action,
  createTopologyControlButtons,
  defaultControlButtonsOptions,
  withPanZoom,
  withSelection,
} from '@patternfly/react-topology';
import * as d3 from 'd3';
import { ComponentType, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { Legend } from './Legend';
import { Loader } from './Loader';
import { InstanceDetailSidebar } from './Sidebar';
import { MeshEdge } from './components/MeshEdge';
import { MeshNode } from './components/MeshNode';
import { WebWorkerResponse } from './types';

const ContentLoading = styled(Loader)`
  height: 100%;
  position: absolute;
  width: 100%;
  background: white;
`;

const baselineComponentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  switch (type) {
    case 'group':
      return DefaultGroup;
    default:
      switch (kind) {
        case ModelKind.graph:
          return withPanZoom()(GraphComponent);
        case ModelKind.node:
          return withSelection()(MeshNode as ComponentType);
        case ModelKind.edge:
          return MeshEdge;
        default:
          return undefined;
      }
  }
};

const NODE_DIAMETER = 50;

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
      return NodeStatus.default;
    case 'adding':
      return NodeStatus.success;
    case 'removing':
      return NodeStatus.danger;
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
    progress: 0,
  });
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const controllerRef = useRef<Visualization>();
  const controller = controllerRef.current;

  function toggleLegend() {
    setShowLegend(!showLegend);
  }

  function handleProgress(progress: number) {
    const calculatedPercent: number = Math.round(progress * 100);
    setProgress(calculatedPercent);
    setTimeout(() => {
      return calculatedPercent === 100 ? setIsLoading(false) : setIsLoading(true);
    }, 100);
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
    function handleMeshLayout(data: WebWorkerResponse) {
      setMeshLayout(() => ({ ...data }));
      // close the worker thread
      getData.terminate();
    }
    if (window.Worker) {
      getData.onmessage = function handleWorkerEvent(event: { data: WebWorkerResponse }) {
        switch (event.data.type) {
          case 'tick':
            return handleProgress(event.data.progress);
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
        shape: NodeShape.rect,
        data: {
          nodeType: n.node_type,
          nodeStatus: n.node_state,
        },
      };
    });
    const links: EdgeModel[] = meshLayout.links.map((l) => {
      return {
        id: `edge-${l.source.hostname}-${l.target.hostname}`,
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
    action(() => controller.getGraph().fit(80))();
  }, [meshLayout, controller]);

  if (!controller) {
    return null;
  }

  return (
    <TopologyView
      id="mesh-topology"
      sideBarResizable
      sideBarOpen={selectedIds.length > 0}
      sideBar={
        selectedIds.length > 0 && (
          <TopologySideBar
            data-cy="mesh-viz-sidebar"
            className="mesh-viz-sidebar"
            show={selectedIds.length > 0}
            onClose={() => setSelectedIds([])}
            resizable
          >
            <InstanceDetailSidebar selectedId={selectedIds[0]}></InstanceDetailSidebar>
          </TopologySideBar>
        )
      }
      controlBar={
        !isLoading && (
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
        )
      }
    >
      <VisualizationProvider controller={controller}>
        <VisualizationSurface state={{ selectedIds }} />
      </VisualizationProvider>
      {isLoading && <ContentLoading className="mesh-content-loader" progress={progress} />}
      {showLegend && <Legend />}
    </TopologyView>
  );
};
