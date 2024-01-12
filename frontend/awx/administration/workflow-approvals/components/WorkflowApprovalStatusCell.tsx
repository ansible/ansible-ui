import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { TextCell } from '../../../../../framework';
import { WorkflowApproval } from '../../../interfaces/WorkflowApproval';
import { WorkflowApprovalTimeRemaining } from './WorkflowApprovalTimeRemaining';

export function WorkflowApprovalStatusCell(props: { workflow_approval: WorkflowApproval }) {
  const { t } = useTranslation();

  if (props.workflow_approval.timed_out) {
    return (
      <TextCell
        text={t`Timed out`}
        color={'red'}
        iconColor={'danger'}
        icon={<ExclamationCircleIcon />}
      />
    );
  }

  if (props.workflow_approval.canceled_on) {
    return (
      <TextCell
        text={t`Canceled`}
        color={'orange'}
        iconColor={'warning'}
        icon={<ExclamationTriangleIcon />}
      />
    );
  }

  switch (props.workflow_approval.status) {
    case 'new':
    case 'pending':
    case 'waiting':
    case 'running':
      if (props.workflow_approval.approval_expiration) {
        return (
          <WorkflowApprovalTimeRemaining
            approval_expiration={props.workflow_approval.approval_expiration}
          />
        );
      }
      return (
        <TextCell text={t`Never expires`} color={'blue'} iconColor={'info'} icon={<ClockIcon />} />
      );
    case 'successful':
      return (
        <TextCell
          text={t`Approved`}
          color={'green'}
          iconColor={'success'}
          icon={<CheckCircleIcon />}
        />
      );
    case 'failed':
      return (
        <TextCell
          text={t`Denied`}
          color={'red'}
          iconColor={'danger'}
          icon={<ExclamationCircleIcon />}
        />
      );
    case 'error':
      return (
        <TextCell
          text={t`Error`}
          color={'red'}
          iconColor={'danger'}
          icon={<ExclamationCircleIcon />}
        />
      );
    default:
      return (
        <TextCell
          text={t`Unknown`}
          color={'yellow'}
          iconColor={'warning'}
          icon={<ExclamationTriangleIcon />}
        />
      );
  }
}
