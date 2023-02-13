/* eslint-disable react/no-unknown-property */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'styled-components/macro';

import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { shape } from 'prop-types';
import styled from 'styled-components';
import { secondsToHHMMSS } from 'util/dates';
import { stringIsUUID } from 'utils/strings.jsx';

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

const ResourceDeleted = styled.p`
  margin-bottom: ${(props) => (props.job ? '10px' : '0px')};
`;

const StyledExclamationTriangleIcon = styled(ExclamationTriangleIcon)`
  color: #f0ad4d;
  height: 20px;
  margin-right: 10px;
  width: 20px;
`;

function WorkflowNodeHelp({ node }) {
  let nodeType;
  const job = node?.originalNodeObject?.summary_fields?.job;
  const unifiedJobTemplate =
    node?.fullUnifiedJobTemplate || node?.originalNodeObject?.summary_fields?.unified_job_template;
  let identifier = null;
  if (node?.identifier) {
    ({ identifier } = node);
  } else if (
    node?.originalNodeObject?.identifier &&
    !stringIsUUID(node.originalNodeObject.identifier)
  ) {
    ({
      originalNodeObject: { identifier },
    } = node);
  }
  if (unifiedJobTemplate || job) {
    const type = unifiedJobTemplate
      ? unifiedJobTemplate.unified_job_type || unifiedJobTemplate.type
      : job.type;
    switch (type) {
      case 'job_template':
      case 'job':
        nodeType = `Job Template`;
        break;
      case 'workflow_job_template':
      case 'workflow_job':
        nodeType = `Workflow Job Template`;
        break;
      case 'project':
      case 'project_update':
        nodeType = `Project Update`;
        break;
      case 'inventory_source':
      case 'inventory_update':
        nodeType = `Inventory Update`;
        break;
      case 'workflow_approval_template':
      case 'workflow_approval':
        nodeType = `Workflow Approval`;
        break;
      case 'system_job_template':
      case 'system_job':
        nodeType = `Management Job`;
        break;
      default:
        nodeType = '';
    }
  }

  let jobStatus;
  if (job) {
    switch (job.status) {
      case 'new':
        jobStatus = `New`;
        break;
      case 'pending':
        jobStatus = `Pending`;
        break;
      case 'waiting':
        jobStatus = `Waiting`;
        break;
      case 'running':
        jobStatus = `Running`;
        break;
      case 'successful':
        jobStatus = `Successful`;
        break;
      case 'failed':
        jobStatus = `Failed`;
        break;
      case 'error':
        jobStatus = `Error`;
        break;
      case 'canceled':
        jobStatus = `Canceled`;
        break;
      case 'never updated':
        jobStatus = `Never Updated`;
        break;
      case 'ok':
        jobStatus = `OK`;
        break;
      case 'missing':
        jobStatus = `Missing`;
        break;
      case 'none':
        jobStatus = `None`;
        break;
      case 'updating':
        jobStatus = `Updating`;
        break;
      default:
        jobStatus = '';
    }
  }

  return (
    <>
      {!unifiedJobTemplate && (!job || job.type !== 'workflow_approval') && (
        <ResourceDeleted job={job}>
          <StyledExclamationTriangleIcon />
          {'The resource associated with this node has been deleted.'}
        </ResourceDeleted>
      )}
      {job && (
        <GridDL>
          {identifier && (
            <>
              <dt>
                <b>{'Node Alias'}</b>
              </dt>
              <dd id="workflow-node-help-alias">{identifier}</dd>
            </>
          )}
          <dt>
            <b>{`Resource Name`}</b>
          </dt>
          <dd id="workflow-node-help-name">{unifiedJobTemplate?.name || `Deleted`}</dd>
          <dt>
            <b>{`Type`}</b>
          </dt>
          <dd id="workflow-node-help-type">{nodeType}</dd>
          <dt>
            <b>{`Job Status`}</b>
          </dt>
          <dd id="workflow-node-help-status">{jobStatus}</dd>
          {typeof job.elapsed === 'number' && (
            <>
              <dt>
                <b>{`Elapsed`}</b>
              </dt>
              <dd id="workflow-node-help-elapsed">{secondsToHHMMSS(job.elapsed)}</dd>
            </>
          )}
        </GridDL>
      )}
      {unifiedJobTemplate && !job && (
        <GridDL>
          {identifier && (
            <>
              <dt>
                <b>{`Node Alias`}</b>
              </dt>
              <dd id="workflow-node-help-alias">{identifier}</dd>
            </>
          )}
          <dt>
            <b>{`Resource Name`}</b>
          </dt>
          <dd id="workflow-node-help-name">{unifiedJobTemplate?.name || `Deleted`}</dd>
          <dt>
            <b>{`Type`}</b>
          </dt>
          <dd id="workflow-node-help-type">{nodeType}</dd>
        </GridDL>
      )}
      {job && job.type !== 'workflow_approval' && (
        <p css="margin-top: 10px">{`Click to view job details`}</p>
      )}
    </>
  );
}

WorkflowNodeHelp.propTypes = {
  node: shape().isRequired,
};

export default WorkflowNodeHelp;
