import {
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  HourglassStartIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { RunningIcon, TextCell } from '../../framework';

export function StatusCell(props: { status?: string; disableLinks?: boolean; to?: string }) {
  const { t } = useTranslation();
  switch (props.status) {
    case 'disabled':
      return (
        <TextCell
          text={t`Disabled`}
          color={'grey'}
          iconColor={'disabled'}
          icon={<BanIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'healthy':
      return (
        <TextCell
          text={t`Healthy`}
          color={'green'}
          iconColor={'success'}
          icon={<CheckCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'completed':
      return (
        <TextCell
          text={t`Completed`}
          color={'green'}
          iconColor={'success'}
          icon={<CheckCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'successful':
      return (
        <TextCell
          text={t`Successful`}
          color={'green'}
          iconColor={'success'}
          icon={<CheckCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'failed':
      return (
        <TextCell
          text={t`Failed`}
          color={'red'}
          iconColor={'danger'}
          icon={<ExclamationCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'error':
      return (
        <TextCell
          text={t`Error`}
          color={'red'}
          iconColor={'danger'}
          icon={<ExclamationCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'starting':
      return (
        <TextCell
          text={t`Starting`}
          color={'grey'}
          iconColor={'disabled'}
          icon={<HourglassStartIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'waiting':
      return (
        <TextCell
          text={t`Waiting`}
          color={'grey'}
          iconColor={'disabled'}
          icon={<ClockIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'pending':
      return (
        <TextCell
          text={t`Pending`}
          color={'blue'}
          iconColor={'info'}
          icon={<ClockIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'new':
      return (
        <TextCell
          text={t`Pending`}
          color={'blue'}
          iconColor={'info'}
          icon={<InfoCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'running':
      return (
        <TextCell
          text={t`Running`}
          color={'blue'}
          iconColor={'info'}
          icon={<RunningIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'stopping':
      return (
        <TextCell
          text={t`Stopping`}
          color={'grey'}
          iconColor={'disabled'}
          icon={<HourglassStartIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'stopped':
      return (
        <TextCell
          text={t`Stopped`}
          color={'grey'}
          iconColor={'disabled'}
          icon={<BanIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'canceled':
      return (
        <TextCell
          text={t`Canceled`}
          color={'yellow'}
          iconColor={'warning'}
          icon={<ExclamationTriangleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'never-updated':
      return (
        <TextCell
          text={t`Never updated`}
          color={'blue'}
          iconColor={'info'}
          icon={<InfoCircleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    case 'unresponsive':
      return (
        <TextCell
          text={t`unresponsive`}
          color={'yellow'}
          iconColor={'warning'}
          icon={<ExclamationTriangleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
    default:
      return (
        <TextCell
          text={t`Unknown`}
          color={'yellow'}
          iconColor={'warning'}
          icon={<ExclamationTriangleIcon />}
          to={props.to}
          disableLinks={props.disableLinks}
        />
      );
  }
}
