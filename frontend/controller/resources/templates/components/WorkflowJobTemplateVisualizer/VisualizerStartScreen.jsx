/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react/prop-types */
import { useContext } from 'react';
// import 'styled-components/macro';

import { Button as PFButton } from '@patternfly/react-core';
import styled from 'styled-components';
import { WorkflowDispatchContext } from './shared/WorkflowContext.jsx';

const Button = styled(PFButton)`
  && {
    background-color: #5cb85c;
    padding: 5px 8px;
    --pf-global--FontSize--md: 14px;
    margin-top: 20px;
  }
`;

const StartPanel = styled.div`
  background-color: white;
  border: 1px solid #c7c7c7;
  padding: 60px 80px;
  text-align: center;
`;

const StartPanelWrapper = styled.div`
  align-items: center;
  background-color: #f6f6f6;
  display: flex;
  height: 100%;
  justify-content: center;
`;

function VisualizerStartScreen({ readOnly }) {
  const dispatch = useContext(WorkflowDispatchContext);
  return (
    <div css="flex: 1">
      <StartPanelWrapper>
        <StartPanel>
          {readOnly ? (
            <p>{`This workflow does not have any nodes configured.`}</p>
          ) : (
            <>
              <p>{`Please click the Start button to begin.`}</p>
              <Button
                ouiaId="visualizer-start-button"
                id="visualizer-start"
                aria-label={`Start`}
                onClick={() => dispatch({ type: 'START_ADD_NODE', sourceNodeId: 1 })}
                variant="primary"
              >
                {`Start`}
              </Button>
            </>
          )}
        </StartPanel>
      </StartPanelWrapper>
    </div>
  );
}

export default VisualizerStartScreen;
