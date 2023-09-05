import { Label } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HourglassStartIcon,
  InfoCircleIcon,
  MinusCircleIcon,
  StopCircleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { RunningIcon, TextCell } from '../../framework';

export function StatusCell(props: { status?: string; disableLinks?: boolean; to?: string }) {
  const { t } = useTranslation();
  const status = props.status || 'default';

  const label = useLabel(status, t);
  const color = getColor(status);
  const Icon = getIcon(status);

  return (
    <TextCell
      text={label}
      color={color}
      icon={Icon ? <Icon /> : null}
      to={props.to}
      disableLinks={props.disableLinks}
    />
  );
}

export function StatusLabel(props: { status?: string }) {
  const { t } = useTranslation();
  const status = props.status || 'default';

  const label = useLabel(status, t);
  const color = getColor(status);
  const Icon = getIcon(status);

  return (
    <Label variant="outline" color={color} icon={Icon ? <Icon /> : null}>
      {label}
    </Label>
  );
}

function useLabel(status: string, t: (str: string) => string) {
  const labels: { [key: string]: string } = {
    approved: t('Approved'),
    completed: t('Completed'),
    canceled: t('Canceled'),
    changed: t('Changed'),
    deleting: t('Deleting'),
    denied: t('Denied'),
    'deprovision-fail': t('Deprovisioning fail'),
    deprovisioning: t('Deprovisioning'),
    disabled: t('Disabled'),
    error: t('Error'),
    failed: t('Failed'),
    healthy: t('Healthy'),
    installed: t('Installed'),
    new: t('New'),
    'never-updated': t('Never updated'),
    ok: t('OK'),
    'provion-fail': t('Provisioning fail'),
    pending: t('Pending'),
    provisioning: t('Provisioning'),
    ready: t('Ready'),
    running: t('Running'),
    skipped: t('Skipped'),
    starting: t('Starting'),
    stopping: t('Stopping'),
    stopped: t('Stopped'),
    success: t('Success'),
    successful: t('Successful'),
    timedOut: t('Timed out'),
    unavailable: t('Unavailable'),
    unresponsive: t('Unresponsive'),
    unknown: t('Unknown'),
    unreachable: t('Unreachable'),
    waiting: t('Waiting'),
  };

  return labels[status] || status;
}

function getColor(status: string) {
  switch (status) {
    case 'approved':
    case 'completed':
    case 'healthy':
    case 'ok':
    case 'ready':
    case 'successful':
    case 'success':
      return 'green';
    case 'denied':
    case 'deprovision-fail':
    case 'error':
    case 'failed':
    case 'provision-fail':
    case 'timedOut':
    case 'unavailable':
    case 'unreachable':
      return 'red';
    case 'installed':
    case 'new':
    case 'never-updated':
    case 'pending':
    case 'running':
    case 'skipped':
      return 'blue';
    case 'canceled':
    case 'changed':
    case 'unknown':
      return 'orange';
    case 'stopped':
      return undefined;
    case 'deleting':
    case 'deprovisioning':
    case 'disabled':
    case 'provisioning':
    case 'starting':
    case 'waiting':
    default:
      return 'grey';
  }
}

function getIcon(status: string) {
  switch (status) {
    case 'approved':
    case 'completed':
    case 'healthy':
    case 'ok':
    case 'ready':
    case 'successful':
    case 'success':
      return CheckCircleIcon;
    case 'denied':
    case 'new':
    case 'never-updated':
      return InfoCircleIcon;
    case 'deprovision-fail':
    case 'error':
    case 'failed':
    case 'provision-fail':
    case 'timedOut':
    case 'unavailable':
    case 'unreachable':
    case 'unresponsive':
      return ExclamationCircleIcon;
    case 'installed':
    case 'pending':
    case 'waiting':
      return ClockIcon;
    case 'running':
      return RunningIcon;
    case 'canceled':
    case 'changed':
    case 'unknown':
      return ExclamationTriangleIcon;
    case 'disabled':
      return BanIcon;
    case 'deprovisioning':
    case 'provisioning':
    case 'skipped':
      return MinusCircleIcon;
    case 'deleting':
    case 'starting':
    case 'stopping':
      return HourglassStartIcon;
    case 'stopped':
      return StopCircleIcon;
    default:
      return null;
  }
}
