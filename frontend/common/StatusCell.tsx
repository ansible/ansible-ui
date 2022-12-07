import {
  BanIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoIcon,
} from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PFColorE, RunningIcon, TextCell } from '../../framework';

export function StatusCell(props: { status?: string }) {
  const { t } = useTranslation();
  switch (props.status) {
    case 'disabled':
      return <TextCell icon={<BanIcon />} text={t('Disabled')} color={PFColorE.Grey} />;
    case 'healthy':
      return <TextCell icon={<CheckCircleIcon />} text={t('Healthy')} color={PFColorE.Green} />;
    case 'completed':
      return <TextCell icon={<CheckCircleIcon />} text={t('Completed')} color={PFColorE.Green} />;
    case 'successful':
      return <TextCell icon={<CheckCircleIcon />} text={t('Successful')} color={PFColorE.Green} />;
    case 'failed':
      return <TextCell icon={<ExclamationCircleIcon />} text={t('Failed')} color={PFColorE.Red} />;
    case 'error':
      return <TextCell icon={<ExclamationCircleIcon />} text={t('Error')} color={PFColorE.Red} />;
    case 'waiting':
      return <TextCell icon={<ClockIcon />} text={t('Waiting')} color={PFColorE.Grey} />;
    case 'pending':
      return <TextCell icon={<ClockIcon />} text={t('Pending')} color={PFColorE.Blue} />;
    case 'new':
      return <TextCell icon={<InfoIcon />} text={t('Pending')} color={PFColorE.Blue} />;
    case 'running':
      return <TextCell icon={<RunningIcon />} text={t('Running')} color={PFColorE.Blue} />;
    case 'canceled':
      return (
        <TextCell icon={<ExclamationTriangleIcon />} text={t('Canceled')} color={PFColorE.Yellow} />
      );
    case 'never-updated':
      return <TextCell icon={<InfoIcon />} text={t('Never updated')} color={PFColorE.Blue} />;
    default:
      return (
        <TextCell icon={<ExclamationTriangleIcon />} text={t('Unknown')} color={PFColorE.Yellow} />
      );
  }
}
