import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { ReactElement, createContext, useContext, useEffect, useState } from 'react';
import {
  useVisualizationController,
  observer,
  NodeModel,
  Node,
  Edge,
  EdgeModel,
} from '@patternfly/react-topology';
import { useRemoveGraphElements } from './hooks';
import { ControllerState, GraphEdgeData, GraphNodeData } from './types';
import { GRAPH_ID, START_NODE_ID } from './constants';

const FullPage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  z-index: 1000;
`;

const ViewWrapper = styled.div`
  width: 100%;
  height: 100%;
  .pf-topology-container {
    min-height: 0;
  }
  .pf-v5-c-toolbar__group {
    flex: 1;
    width: 100%;
    display: flex;
  }
`;
export interface IViewOptions {
  toggleFullScreen: () => void;
  isFullScreen: boolean;
  isLegendOpen: boolean;
  toggleLegend: () => void;
  isEmpty: boolean;
  isLoading: boolean;
  sidebarMode: 'add' | 'edit' | 'view' | undefined;
  selectedIds: string[];
  setSidebarMode: (value: 'add' | 'edit' | 'view' | undefined) => void;
  removeNodes: (item: Node<NodeModel, GraphNodeData>[]) => void;
  removeLink: (item: Edge<EdgeModel, GraphEdgeData>) => void;
}

export const ViewOptionsContext = createContext<IViewOptions>({
  toggleFullScreen: () => {},
  isFullScreen: false,
  isLegendOpen: false,
  toggleLegend: () => {},
  isEmpty: false,
  isLoading: true,
  sidebarMode: undefined,
  setSidebarMode: () => null,
  removeNodes: () => null,
  removeLink: () => null,
  selectedIds: [],
});

export const ViewOptionsProvider = observer((props: { children: ReactElement }) => {
  const { children } = props;
  const controller = useVisualizationController();
  const { selectedIds } = controller.getState<ControllerState>();
  const nodes = controller
    .getGraph()
    .getNodes()
    .find((n) => n.isVisible() && n.getId() !== START_NODE_ID);
  const isGraphReady = controller.toModel().graph?.visible;
  const isGraphSelected = !!selectedIds?.length && selectedIds[0] === GRAPH_ID;
  const { removeNodes, removeLink } = useRemoveGraphElements();
  const [isEmpty, setIsEmpty] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isGraphReady ? false : true);
  const [sidebarMode, setSidebarMode] = useState<'add' | 'edit' | 'view' | undefined>(undefined);

  useEffect(() => {
    if (isGraphReady) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [isGraphReady]);

  useEffect(() => {
    if (isLoading) return;

    if (nodes === undefined) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
  }, [nodes, isLoading]);

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      setIsFullScreen(true);
    } else {
      setIsFullScreen(false);
    }
  };

  const toggleLegend = () => {
    if (!isLegendOpen) {
      setIsLegendOpen(true);
    } else {
      setIsLegendOpen(false);
    }
  };

  useEffect(() => {
    if (isGraphSelected) {
      setSidebarMode(undefined);
    }
  }, [isGraphSelected]);

  const value = {
    isFullScreen,
    toggleFullScreen,
    isLegendOpen,
    toggleLegend,
    isLoading,
    isEmpty,
    sidebarMode,
    selectedIds,
    setSidebarMode,
    removeNodes,
    removeLink,
  };

  return (
    <ViewOptionsContext.Provider value={value}>
      {isFullScreen ? (
        <AppendBody>
          <ViewWrapper>
            <FullPage data-cy="full-page-visualizer">{children}</FullPage>
          </ViewWrapper>
        </AppendBody>
      ) : (
        <ViewWrapper>{children}</ViewWrapper>
      )}
    </ViewOptionsContext.Provider>
  );
});

export const useViewOptions = () => {
  const context = useContext(ViewOptionsContext);
  if (!context) {
    throw new Error('useViewOptions must be used within a ViewOptions');
  }

  return context;
};

function AppendBody(props: { children: ReactElement }) {
  const { children } = props;
  const [el] = useState(document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(el);
    return () => {
      document.body.removeChild(el);
    };
  }, [el]);

  return ReactDOM.createPortal(children, el);
}
