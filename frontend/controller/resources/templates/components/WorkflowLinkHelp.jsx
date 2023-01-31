/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React from 'react';

import styled from 'styled-components';
import { shape } from 'prop-types';

const GridDL = styled.dl`
  column-gap: 15px;
  display: grid;
  grid-template-columns: max-content;
  row-gap: 0px;
  dt {
    grid-column-start: 1;
  }
  dd {
    grid-column-start: 2;
  }
`;

function WorkflowLinkHelp({ link }) {
  let linkType;
  switch (link.linkType) {
    case 'always':
      linkType = 'Always';
      break;
    case 'success':
      linkType = 'On Success';
      break;
    case 'failure':
      linkType = 'On Failure';
      break;
    default:
      linkType = '';
  }

  return (
    <GridDL>
      <dt>
        <b>{'Run'}</b>
      </dt>
      <dd id="workflow-link-help-type">{linkType}</dd>
    </GridDL>
  );
}

WorkflowLinkHelp.propTypes = {
  link: shape().isRequired,
};

export default WorkflowLinkHelp;
