/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PencilAltIcon, PlusIcon, TrashAltIcon } from '@patternfly/react-icons';
import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import WorkflowActionTooltipItem from './shared/WorkflowActionsTooltipItem.jsx';
import WorkflowActionTooltip from './shared/WorkflowActionTooltip.jsx';
import { generateLine, getLinePoints, getLinkOverlayPoints } from './utils/utils.jsx';
import { WorkflowDispatchContext, WorkflowStateContext } from './shared/WorkflowContext.jsx';

const LinkG = styled.g`
  pointer-events: ${(props) => (props.ignorePointerEvents ? 'none' : 'auto')};
`;

function VisualizerLink({ link, updateLinkHelp, readOnly, updateHelpText }) {
  const ref = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [pathD, setPathD] = useState();
  const [pathStroke, setPathStroke] = useState('#CCCCCC');
  const [tooltipX, setTooltipX] = useState();
  const [tooltipY, setTooltipY] = useState();
  const dispatch = useContext(WorkflowDispatchContext);
  const { addingLink, nodePositions } = useContext(WorkflowStateContext);

  const addNodeAction = (
    <WorkflowActionTooltipItem
      id="link-add-node"
      key="add"
      onClick={() => {
        updateHelpText(null);
        setHovering(false);
        dispatch({
          type: 'START_ADD_NODE',
          sourceNodeId: link.source.id,
          targetNodeId: link.target.id,
        });
      }}
      onMouseEnter={() => updateHelpText(t`Add a new node between these two nodes`)}
      onMouseLeave={() => updateHelpText(null)}
    >
      <PlusIcon />
    </WorkflowActionTooltipItem>
  );

  const tooltipActions =
    link.source.id === 1
      ? [addNodeAction]
      : [
          addNodeAction,
          <WorkflowActionTooltipItem
            id="link-edit"
            key="edit"
            onClick={() => {
              updateHelpText(null);
              setHovering(false);
              dispatch({ type: 'SET_LINK_TO_EDIT', value: link });
            }}
            onMouseEnter={() => updateHelpText(t`Edit this link`)}
            onMouseLeave={() => updateHelpText(null)}
          >
            <PencilAltIcon />
          </WorkflowActionTooltipItem>,
          <WorkflowActionTooltipItem
            id="link-delete"
            key="delete"
            onClick={() => {
              updateHelpText(null);
              setHovering(false);
              dispatch({ type: 'START_DELETE_LINK', link });
            }}
            onMouseEnter={() => updateHelpText(t`Delete this link`)}
            onMouseLeave={() => updateHelpText(null)}
          >
            <TrashAltIcon />
          </WorkflowActionTooltipItem>,
        ];

  const handleLinkMouseEnter = () => {
    const startNode = document.getElementById('node-1');
    ref.current.parentNode.insertBefore(ref.current, startNode);
    setHovering(true);
  };

  const handleLinkMouseLeave = () => {
    ref.current.parentNode.prepend(ref.current);
    setHovering(null);
  };

  useEffect(() => {
    if (link.linkType === 'failure') {
      setPathStroke('#d9534f');
    }
    if (link.linkType === 'success') {
      setPathStroke('#5cb85c');
    }
    if (link.linkType === 'always') {
      setPathStroke('#337ab7');
    }
  }, [link.linkType]);

  useEffect(() => {
    const linePoints = getLinePoints(link, nodePositions);
    setPathD(generateLine(linePoints));
    setTooltipX((linePoints[0].x + linePoints[1].x) / 2);
    setTooltipY((linePoints[0].y + linePoints[1].y) / 2);
  }, [link, nodePositions]);

  return (
    <LinkG
      id={`link-${link.source.id}-${link.target.id}`}
      ignorePointerEvents={addingLink}
      onMouseEnter={handleLinkMouseEnter}
      onMouseLeave={handleLinkMouseLeave}
      ref={ref}
    >
      <polygon
        fill="#E1E1E1"
        id={`link-${link.source.id}-${link.target.id}-background`}
        opacity={hovering ? '1' : '0'}
        points={getLinkOverlayPoints(link, nodePositions)}
      />
      <path d={pathD} stroke={pathStroke} strokeWidth="2px" />
      <polygon
        id={`link-${link.source.id}-${link.target.id}-overlay`}
        onMouseEnter={() => updateLinkHelp(link)}
        onMouseLeave={() => updateLinkHelp(null)}
        opacity="0"
        points={getLinkOverlayPoints(link, nodePositions)}
      />
      {!readOnly && hovering && (
        <WorkflowActionTooltip actions={tooltipActions} pointX={tooltipX} pointY={tooltipY} />
      )}
    </LinkG>
  );
}

export default VisualizerLink;
