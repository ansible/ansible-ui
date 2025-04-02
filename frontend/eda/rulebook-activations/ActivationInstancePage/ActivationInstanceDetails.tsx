import { LoadingPage, PageDetail, PageDetails } from '@ansible/ansible-ui-framework';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { StatusCell } from '../../../common/Status';
import { ActivationInstanceEvents } from './ActivationInstanceEvents';

export function ActivationInstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: activationInstance } = useGetItem<EdaActivationInstance>(
    edaAPI`/activation-instances/`,
    params.instanceId
  );
  if (!activationInstance) {
    return <LoadingPage />;
  }
  return (
    <>
      <PageDetails disableScroll={true}>
        <PageDetail label={t('Name')}>
          {`${activationInstance?.id || ''} - ${activationInstance?.name || ''}`}
        </PageDetail>
        <PageDetail label={t('Status')}>
          {<StatusCell status={activationInstance?.status || 'unknown'} />}
        </PageDetail>
        <PageDetail label={t('Start date')}>
          {activationInstance?.started_at ? formatDateString(activationInstance?.started_at) : ''}
        </PageDetail>
        <PageDetail label={t('End date')}>
          {activationInstance?.ended_at ? formatDateString(activationInstance?.ended_at) : ''}
        </PageDetail>
      </PageDetails>
      <ActivationInstanceEvents />
    </>
  );
}
