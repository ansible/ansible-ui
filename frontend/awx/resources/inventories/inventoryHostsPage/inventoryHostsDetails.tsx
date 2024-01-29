/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DateTimeCell, PageDetail, PageDetails, usePageNavigate } from '../../../../../framework';
import { AwxHost } from '../../../interfaces/AwxHost';
import { Sparkline } from '../../templates/components/Sparkline';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { useGetHost } from '../../hosts/hooks/useGetHost';

export function InventoryHostsDetails() {
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const { host } = useGetHost(params.host_id as string);

  if (!host) {
    return null;
  }

  return <InventoryHostsDetailsInner host={host} />;
}

export function InventoryHostsDetailsInner(props: { host: AwxHost }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const host = props.host;

  const recentPlaybookJobs = host.summary_fields.recent_jobs.map((job) => ({
    ...job,
    canceled_on: null,
  }));

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{host.name}</PageDetail>
      <PageDetail label={t('Activity')}>
        <Sparkline jobs={recentPlaybookJobs} />
      </PageDetail>
      <PageDetail label={t('Created')}>
        <DateTimeCell
          format="since"
          value={host.created}
          author={host.summary_fields?.created_by?.username}
          onClick={() =>
            pageNavigate(AwxRoute.UserDetails, {
              params: { id: host.summary_fields?.created_by?.id },
            })
          }
        />
      </PageDetail>
      <LastModifiedPageDetail
        format="since"
        value={host.modified}
        author={host.summary_fields?.modified_by?.username}
        onClick={() =>
          pageNavigate(AwxRoute.UserDetails, {
            params: { id: host.summary_fields?.modified_by?.id },
          })
        }
      />
      <PageDetailCodeEditor
        label={t('Variables')}
        showCopyToClipboard
        value={host.variables || '---'}
      />
    </PageDetails>
  );
}
