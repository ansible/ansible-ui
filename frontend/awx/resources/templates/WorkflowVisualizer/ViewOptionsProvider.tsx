import styled from 'styled-components';
import { ReactElement, createContext, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useVisualizationController, observer, isNode } from '@patternfly/react-topology';

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
});

export const ViewOptionsProvider = observer((props: { children: ReactElement }) => {
  const { children } = props;
  const controller = useVisualizationController();

  const nodes = controller.getElements().filter(isNode);
  const isGraphReady = controller.toModel().graph?.visible;

  const [isEmpty, setIsEmpty] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(isGraphReady ? false : true);

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
