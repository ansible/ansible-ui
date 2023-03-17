import { BanIcon, ClockIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Alert } from '@patternfly/react-core';
import { PFColorE, RunningIcon } from '../../framework';

export function StatusCell(props: { status?: string }) {
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
    case 'healthy':
      return <Alert variant="success" title={t('Healthy')} isPlain isInline />;
    case 'completed':
      return <Alert variant="success" title={t('Completed')} isPlain isInline />;
    case 'successful':
      return <Alert variant="success" title={t('Successful')} isPlain isInline />;
    case 'failed':
      return <Alert variant="danger" title={t('Failed')} isPlain isInline />;
    case 'error':
      return <Alert variant="danger" title={t('Error')} isPlain isInline />;
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
