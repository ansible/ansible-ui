import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { LoadingPage, PageDetail, PageDetails } from '../../../../framework';
import { PageDetailCodeEditor } from '../../../../framework/PageDetails/PageDetailCodeEditor';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { AwxItemsResponse } from '../../../awx/common/AwxItemsResponse';
import { StatusCell } from '../../../common/Status';
import { useGet, useGetItem } from '../../../common/crud/useGet';
import { PageDetailsSection } from '../../common/PageDetailsSection';
import { edaAPI } from '../../common/eda-utils';
import { EdaEventStreamInstance } from '../../interfaces/EdaEventStreamInstance';
import { EdaEventStreamInstanceLog } from '../../interfaces/EdaEventStreamInstanceLog';

export function EventStreamInstanceDetails() {
  const { t } = useTranslation();
  const params = useParams<{ instanceId: string }>();
  const { data: eventStreamInstance } = useGetItem<EdaEventStreamInstance>(
    edaAPI`/activation-instances/`,
    params.instanceId
  );
  const { data: eventStreamInstanceLogInfo } = useGet<AwxItemsResponse<EdaEventStreamInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=1`
  );
  const { data: eventStreamInstanceLog } = useGet<AwxItemsResponse<EdaEventStreamInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=${
      eventStreamInstanceLogInfo?.count.toString() || '10'
    }`
  );
  if (!eventStreamInstance) {
    return <LoadingPage />;
  }
  return (
    <PageDetails>
      <PageDetail label={t('Name')}>
        {`${eventStreamInstance?.id || ''} - ${eventStreamInstance?.name || ''}`}
      </PageDetail>
      <PageDetail label={t('Status')}>
        {<StatusCell status={eventStreamInstance?.status || 'unknown'} />}
      </PageDetail>
      <PageDetail label={t('Start date')}>
        {eventStreamInstance?.started_at ? formatDateString(eventStreamInstance?.started_at) : ''}
      </PageDetail>
      <PageDetail label={t('End date')}>
        {eventStreamInstance?.ended_at ? formatDateString(eventStreamInstance?.ended_at) : ''}
      </PageDetail>
      <PageDetailsSection>
        {eventStreamInstanceLog?.results?.length ? (
          <PageDetailCodeEditor
            label={t('Output')}
            data-cy="output-field"
            value={eventStreamInstanceLog?.results?.map((item) => item.log).join('\r\n')}
            showCopyToClipboard={true}
          />
        ) : null}
      </PageDetailsSection>
    </PageDetails>
  );
}
