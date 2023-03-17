import { BanIcon, ClockIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { PFColorE, RunningIcon } from '../../../framework';
import { Alert } from '@patternfly/react-core';

export function StatusLabelCell(props: { status?: string }) {
  const { t } = useTranslation();
  switch (props.status) {
    case 'disabled':
      return (
        <Alert
          customIcon={<BanIcon color={PFColorE.Grey} />}
          title={<div style={{ color: PFColorE.Grey }}>{t('Disabled')}</div>}
          isInline
          isPlain
        />
      );
    case 'completed':
      return (
        <Alert variant="success" title={t('Completed')} color={PFColorE.Green} isPlain isInline />
      );
    case 'successful':
      return (
        <Alert variant="success" title={t('Successful')} color={PFColorE.Green} isPlain isInline />
      );
    case 'success':
      return (
        <Alert variant="success" title={t('Success')} color={PFColorE.Green} isPlain isInline />
      );
    case 'failed':
      return <Alert variant="danger" title={t('Failed')} color={PFColorE.Red} isPlain isInline />;
    case 'error':
      return <Alert variant="danger" title={t('Error')} color={PFColorE.Red} isPlain isInline />;
    case 'waiting':
      return (
        <Alert
          customIcon={<ClockIcon color={PFColorE.Grey} />}
          title={<div style={{ color: PFColorE.Grey }}>{t('Waiting')}</div>}
          isInline
          isPlain
        />
      );
    case 'pending':
      return (
        <Alert customIcon={<ClockIcon />} title={t('Pending')} variant="info" isPlain isInline />
      );
    case 'new':
      return <Alert variant="info" title={t('Pending')} isPlain isInline />;
    case 'running':
      return (
        <Alert customIcon={<RunningIcon />} title={t('Running')} variant="info" isPlain isInline />
      );
    case 'canceled':
      return <Alert variant="warning" title={t('Canceled')} isPlain isInline />;
    case 'never-updated':
      return <Alert variant="info" title={t('Never updated')} isPlain isInline />;
    default:
      return <Alert variant="warning" title={t('Unknown')} isPlain isInline />;
  }
}
