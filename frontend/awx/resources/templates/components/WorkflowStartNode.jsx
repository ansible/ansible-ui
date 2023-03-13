/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useContext, useRef } from 'react';
import styled from 'styled-components';
import { WorkflowStateContext } from './WorkflowJobTemplateVisualizer/shared/WorkflowContext.jsx';

const StartG = styled.g`
  pointer-events: ${(props) => (props.ignorePointerEvents ? 'none' : 'auto')};
`;

const StartForeignObject = styled.foreignObject`
  overflow: visible;
`;

const StartDiv = styled.div`
  background-color: #0279bc;
  color: white;
  width: max-content;
  min-width: 80px;
  height: 40px;
  border-radius: 0.35em;
  text-align: center;
  line-height: 40px;
  padding: 0px 10px;
`;

function WorkflowStartNode() {
  const ref = useRef(null);
  const startNodeRef = useRef(null);
  const { addingLink, nodePositions } = useContext(WorkflowStateContext);

  const handleNodeMouseEnter = () => {
    ref.current.parentNode.appendChild(ref.current);
  };

  return (
    <StartG
      id="node-1"
      ignorePointerEvents={addingLink}
      onMouseEnter={handleNodeMouseEnter}
      ref={ref}
      transform={`translate(${nodePositions[1].x},0)`}
    >
      <StartForeignObject height="1" width="1" y="10" style={{ overflow: 'visible' }}>
        <StartDiv ref={startNodeRef}>{`START`}</StartDiv>
      </StartForeignObject>
    </StartG>
  );
}

export default WorkflowStartNode;
