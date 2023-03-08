import { Label } from '@patternfly/react-core';
import {
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PFColorE, RunningIcon } from '../../../framework';

export function StatusLabelCell(props: { status?: string }) {
  const { t } = useTranslation();
  switch (props.status) {
    case 'disabled':
      return (
        <Label icon={<BanIcon />} color={PFColorE.Grey}>
          {t('Disabled')}
        </Label>
      );
    case 'completed':
      return (
        <Label icon={<CheckCircleIcon />} color={PFColorE.Green}>
          {t('Completed')}
        </Label>
      );
    case 'successful':
      return (
        <Label icon={<CheckCircleIcon />} color={PFColorE.Green}>
          {t('Successful')}
        </Label>
      );
    case 'success':
      return (
        <Label icon={<CheckCircleIcon />} color={PFColorE.Green}>
          {t('Success')}
        </Label>
      );
    case 'failed':
      return (
        <Label icon={<ExclamationCircleIcon />} color={PFColorE.Red}>
          {t('Failed')}
        </Label>
      );
    case 'error':
      return (
        <Label icon={<ExclamationCircleIcon />} color={PFColorE.Red}>
          {t('Error')}
        </Label>
      );
    case 'waiting':
      return (
        <Label icon={<ClockIcon />} color={PFColorE.Grey}>
          {t('Waiting')}
        </Label>
      );
    case 'pending':
      return (
        <Label icon={<ClockIcon />} color={PFColorE.Blue}>
          {t('Pending')}
        </Label>
      );
    case 'new':
      return (
        <Label icon={<InfoIcon />} color={PFColorE.Blue}>
          {t('Pending')}
        </Label>
      );
    case 'running':
      return (
        <Label icon={<RunningIcon />} color={PFColorE.Blue}>
          {t('Running')}
        </Label>
      );
    case 'canceled':
      return (
        <Label icon={<ExclamationTriangleIcon />} color="gold">
          {t('Canceled')}
        </Label>
      );
    default:
      return (
        <Label icon={<ExclamationTriangleIcon />} color="gold">
          {t('Unknown')}
        </Label>
      );
  }
}
