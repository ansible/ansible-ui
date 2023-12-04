import styled from 'styled-components';
import { ReactElement, createContext, useCallback, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useVisualizationController, observer, isNode } from '@patternfly/react-topology';
import { GraphData } from './types';

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
  .pf-v5-c-toolbar__group {
    flex: 1;
    width: 100%;
    display: flex;
  }
`;

export const ViewOptionsContext = createContext({
  isFullScreen: false,
  toggleFullScreen: () => {},
  isLegendOpen: false,
  toggleLegend: () => {},
  isEmpty: false,
  isLoading: true,
});

export const ViewOptionsProvider = observer((props: { children: ReactElement }) => {
  const { children } = props;
  const controller = useVisualizationController();
  const state: { selectedIds: string[] | [] } = controller.getState();
  const nodes = controller.getElements().filter(isNode);
  const isGraphReady = controller.toModel().graph?.visible;

  const [isEmpty, setIsEmpty] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isGraphReady ? false : true);
  const setGraphData = useCallback(
    (data: GraphData) => {
      controller.getGraph().setData(data);
    },
    [controller]
  );
  useEffect(() => {
    if (state.selectedIds?.length && !state.selectedIds.every((id) => parseInt(id, 10))) {
      const graphData = controller?.getGraph()?.getData() as GraphData;

      controller.getGraph().setData({ ...graphData, sideBarMode: undefined });
    }
  }, [state.selectedIds, setGraphData, controller]);
  useEffect(() => {
    if (isGraphReady) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [isGraphReady]);

  useEffect(() => {
    if (isLoading) return;
    if (nodes.length === 0) {
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

  const value = {
    isFullScreen,
    toggleFullScreen,
    isLegendOpen,
    toggleLegend,
    isLoading,
    isEmpty,
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
