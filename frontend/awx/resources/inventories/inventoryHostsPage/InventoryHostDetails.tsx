/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  PageDetail,
  PageDetails,
  TextCell,
  usePageNavigate,
} from '../../../../../framework';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { AwxHost } from '../../../interfaces/AwxHost';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetHost } from '../../hosts/hooks/useGetHost';
import { Sparkline } from '../../templates/components/Sparkline';
import { useGetPageUrl } from '../../../../../framework';

function useHostDetailParams() {
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();

  let id = params.id;
  let host_id = params.host_id;

  if (!host_id) {
    // the detail is called from the hosts list, id here means host_id, not inventory_id
    host_id = id;
    id = undefined;
  }

  return { id, host_id, inventory_type: params.inventory_type };
}

export function InventoryHostDetails() {
  const params = useHostDetailParams();
  const { host } = useGetHost(params.host_id as string);

  if (!host) {
    return null;
  }

  return <InventoryHostDetailsInner host={host} />;
}

function inventoryKindToType(kind: string) {
  if (kind === 'smart') return 'smart_inventory';
  if (kind === 'constructed') return 'constructed_inventory';
  return 'inventory';
}

export function InventoryHostDetailsInner(props: { host: AwxHost }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();
  const getPageUrl = useGetPageUrl();
  const params = useHostDetailParams();

  const host = props.host;

  const recentPlaybookJobs = host.summary_fields.recent_jobs.map((job) => ({
    ...job,
    canceled_on: null,
  }));

  return (
    <PageDetails>
      <PageDetail label={t('Name')}>{host.name}</PageDetail>
      {recentPlaybookJobs.length > 0 && (
        <PageDetail label={t('Activity')}>
          <Sparkline jobs={recentPlaybookJobs} />
        </PageDetail>
      )}
      <PageDetail label={t('Description')}>{host.description}</PageDetail>
      <PageDetail label={t('Inventory')} helpText={t(`The inventory that this host belongs to.`)}>
        <TextCell
          text={host.summary_fields?.inventory?.name}
          to={getPageUrl(AwxRoute.InventoryDetails, {
            params: {
              id: host.summary_fields?.inventory?.id,
              inventory_type: inventoryKindToType(host.summary_fields?.inventory?.kind),
            },
          })}
        />
      </PageDetail>
      {(params.inventory_type === 'constructed_inventory' ||
        params.inventory_type === 'smart_inventory') && (
        <PageDetail label={t('Enabled')}>
          <TextCell text={host.enabled ? 'On' : 'Off'} />
        </PageDetail>
      )}
      <PageDetail label={t('Created')}>
        <DateTimeCell
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
