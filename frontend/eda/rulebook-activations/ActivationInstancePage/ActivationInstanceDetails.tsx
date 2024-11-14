import { LoadingPage, PageDetail, PageDetails, Scrollable } from '@ansible/ansible-ui-framework';
import { PageDetailCodeEditor } from '@ansible/ansible-ui-framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { StatusCell } from '@ansible/common-ui/Status';
import { useGet, useGetItem } from '@ansible/common-ui/crud/useGet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstance } from '../../interfaces/EdaActivationInstance';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';

export function ActivationInstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: activationInstance } = useGetItem<EdaActivationInstance>(
    edaAPI`/activation-instances/`,
    params.instanceId
  );
  const { data: activationInstanceLogInfo } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=1`
  );
  const { data: activationInstanceLog } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=${
      activationInstanceLogInfo?.count.toString() || '10'
    }`
  );
  if (!activationInstance) {
    return <LoadingPage />;
  }
  return (
    <Scrollable>
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

      <PageDetails disableScroll={true} numberOfColumns={'single'}>
        {activationInstanceLog?.results?.length ? (
          <PageDetailCodeEditor
            label={t('Output')}
            toggleLanguage={false}
            value={activationInstanceLog?.results?.map((item) => item.log).join('\r\n')}
            showCopyToClipboard={true}
          />
        ) : null}
      </PageDetails>
    </Scrollable>
  );
}
