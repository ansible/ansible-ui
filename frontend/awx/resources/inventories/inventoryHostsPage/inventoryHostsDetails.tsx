/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  DateTimeCell,
  IPageAction,
  PageActionSelection,
  PageActionType,
  PageDetail,
  PageDetails,
  usePageNavigate,
} from '../../../../../framework';
import { useGetInventoryHost } from './inventoryHostsPage';
import { AwxHost } from '../../../interfaces/AwxHost';
import { Sparkline } from '../../templates/components/Sparkline';
import { LastModifiedPageDetail } from '../../../../common/LastModifiedPageDetail';
import { AwxRoute } from '../../../main/AwxRoutes';
import { PageDetailCodeEditor } from '../../../../../framework/PageDetails/PageDetailCodeEditor';
import { PageActionSwitch } from '../../../../../framework/PageActions/PageActionSwitch';
import { cannotEditResource } from '../../../../common/utils/RBAChelpers';
import { awxAPI } from '../../../common/api/awx-utils';
import { useEffect, useState } from 'react';
import { usePatchRequest } from '../../../../common/crud/usePatchRequest';

export function InventoryHostsDetails() {
  const params = useParams<{ id: string; inventory_type: string; host_id: string }>();
  const host = useGetInventoryHost(params.id, params.host_id);

  if (!host) {
    return null;
  }

  return <InventoryHostsDetailsInner host={host} />;
}

export function InventoryHostsDetailsInner(props: { host: AwxHost }) {
  const { t } = useTranslation();
  const pageNavigate = usePageNavigate();

  const [host, setHost] = useState<AwxHost>(props.host);

  useEffect(() => {
    setHost(props.host);
  }, [props.host]);

  const recentPlaybookJobs = host.summary_fields.recent_jobs.map((job) => ({
    ...job,
    canceled_on: null,
  }));

  const patchRequest = usePatchRequest<unknown, AwxHost>();
  const handleToggleHost = async (selectedHost: AwxHost, enabled: boolean) => {
    const response = await patchRequest(awxAPI`/hosts/${selectedHost.id.toString()}/`, {
      enabled,
    });
    setHost(response);
  };

  const hostSwitch: IPageAction<AwxHost> = {
    type: PageActionType.Switch,
    ariaLabel: (isEnabled) =>
      isEnabled ? t('Click to disable instance') : t('Click to enable instance'),
    selection: PageActionSelection.Single,
    onToggle: (host, enabled) => handleToggleHost(host, enabled),
    isSwitchOn: (host: AwxHost) => (host.enabled ? true : false),
    label: t('Enabled'),
    labelOff: t('Disabled'),
    isDisabled: (host) => cannotEditResource(host, t),
    tooltip: t(
      'Indicates if a host is available and should be included in running jobs. For hosts that are part of an external inventory, this may be reset by the inventory sync process.'
    ),
  };

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
      <PageActionSwitch action={hostSwitch} selectedItem={host} />
    </PageDetails>
  );
}
