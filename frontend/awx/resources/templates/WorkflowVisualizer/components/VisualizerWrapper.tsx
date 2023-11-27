import styled from 'styled-components';
import { ReactElement, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const FullPage = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: white;
  z-index: 1000;
`;

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

export function VisualizerWrapper(props: { children: ReactElement; isExpanded: boolean }) {
  const { children, isExpanded } = props;
  return (
    <>
      {isExpanded ? (
        <AppendBody>
          <FullPage data-cy="full-page-visualizer">{children}</FullPage>
        </AppendBody>
      ) : (
        children
      )}
    </>
  );
}
