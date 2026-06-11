import {
  ComponentFactory,
  DefaultGroup,
  EdgeModel,
  GraphComponent,
  Model,
  ModelKind,
  NodeModel,
  NodeShape,
  TopologyView as PFTopologyView,
  SELECTION_EVENT,
  TopologyControlBar,
  TopologySideBar,
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
import { ComponentType, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { getEdgeStatus, getEdgeStyle } from './edgeUtils';
import { Legend } from './Legend';
import { Loader } from './Loader';
import { InstanceDetailSidebar } from './Sidebar';
import { MeshEdge } from './components/MeshEdge';
import { MeshNode } from './components/MeshNode';
import { WebWorkerResponse } from './types';
import Worker from './worker.ts?worker';

const ContentLoading = styled(Loader)`
  height: 100%;
  position: absolute;
  width: 100%;
  background: white;
`;
const TopologyView = styled(PFTopologyView)`
  overflow: auto;
  & > div.pf-topology-container {
    max-height: 100%;
  }
`;
const baselineComponentFactory: ComponentFactory = (kind: ModelKind, type: string) => {
  if (type === 'group') {
    return DefaultGroup;
  }
  if (kind === ModelKind.graph) {
    return withPanZoom()(GraphComponent);
  }
  if (kind === ModelKind.node) {
    return withSelection()(MeshNode as ComponentType);
  }
  if (kind === ModelKind.edge) {
    return MeshEdge;
  }
  return undefined;
};

const NODE_DIAMETER = 50;

function getWidth(selector: string) {
  const selected = d3.select(selector).node();
  return selected ? (selected as HTMLElement).getBoundingClientRect().width : 1200;
}

function getHeight(selector: string) {
  const selected = d3.select(selector).node();
  return selected ? (selected as HTMLElement).getBoundingClientRect().height : 800;
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

  useEffect(() => {
    const width = getWidth('#mesh-topology');
    const height = getHeight('#mesh-topology');
    if (!globalThis.Worker) {
      return;
    }

    // Create a new worker each time mesh changes
    const worker = new Worker();

    worker.onmessage = function handleWorkerEvent(event: { data: WebWorkerResponse }) {
      switch (event.data.type) {
        case 'tick':
          handleProgress(event.data.progress);
          break;
        case 'end':
          setMeshLayout(() => ({ ...event.data }));
          worker.terminate();
          break;
      }
    };

    worker.postMessage({
      nodes: mesh.nodes,
      links: mesh.links,
      width: width,
      height: height,
    });

    // Cleanup: terminate worker if component unmounts or mesh changes before worker finishes
    return () => {
      worker.terminate();
    };
  }, [mesh]);

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
  const { t } = useTranslation();

  if (!controller) {
    return null;
  }
  return (
    <VisualizationProvider controller={controller}>
      <TopologyView
        id="mesh-topology"
        sideBarResizable
        sideBarOpen={selectedIds.length > 0}
        sideBar={
          selectedIds.length > 0 && (
            <TopologySideBar
              data-cy="mesh-viz-sidebar"
              data-testid="mesh-viz-sidebar"
              aria-label={t('Mesh Topology sidebar')}
              show
              resizable
            >
              <InstanceDetailSidebar
                onClose={() => setSelectedIds([])}
                selectedId={selectedIds[0]}
              />
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
        <VisualizationSurface state={{ selectedIds }} />
        {isLoading && <ContentLoading className="mesh-content-loader" progress={progress} />}
        {showLegend && <Legend />}
      </TopologyView>
    </VisualizationProvider>
  );
};
