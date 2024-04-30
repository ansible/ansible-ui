import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { PageRoutedTabs } from '../../../../../framework/PageTabs/PageRoutedTabs';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useGetItem } from '../../../../common/crud/useGet';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useSchedulesActions } from '../hooks/useSchedulesActions';
import { resourceEndPoints } from '../hooks/scheduleHelpers';
import { requestGet } from '../../../../common/crud/Data';
import { ScheduleResources } from '../types';
import { Inventory } from '../../../interfaces/Inventory';
import { useEffect, useMemo, useState } from 'react';
import { useAbortController } from '../../../../common/crud/useAbortController';

export function SchedulePage(props: {
  tabs: { label: string; page: string }[];
  backTab: { label: string; page: string; persistentFilterKey: string };
  initialBreadCrumbs: { label?: string; id?: string; to: string }[];
}) {
  const abortController = useAbortController();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const { pathname } = useLocation();
  const urlsplit = pathname.split('/');
  const resourceType =
    Object.keys(resourceEndPoints).find((route) => urlsplit.includes(route)) || '';
  const isInventorySource = urlsplit.includes('sources');
  const getPageUrl = useGetPageUrl();
  const params = useParams<{ id: string; source_id?: string; schedule_id: string }>();
  const {
    error,
    data: schedule,
    refresh,
  } = useGetItem<Schedule>(awxAPI`/schedules`, params.schedule_id);
  const navigate = useNavigate();
  const {
    error: resourceError,
    data: resource,
    refresh: resourceRefresh,
  } = useGetItem<ScheduleResources>(
    `${resourceEndPoints[resourceType]}`,
    isInventorySource ? params.source_id : params.id
  );
  const itemActions = useSchedulesActions({
    onScheduleToggleorDeleteCompleted: () => navigate(getPageUrl(AwxRoute.Schedules)),
  });

  useEffect(() => {
    void fetchInventory();
    async function fetchInventory() {
      if (!isInventorySource || !params.id) return;
      await requestGet<Inventory>(awxAPI`/inventories/${params.id}/`, abortController.signal).then(
        (inv) => {
          setInventory(inv);
        }
      );
    }
  }, [isInventorySource, params.id, abortController.signal]);
  const breadCrumbs = useMemo(() => {
    const completedBreadcrumbs = props.initialBreadCrumbs.map((route) => {
      if (route.id === 'data') {
        return {
          label: `${resource?.name}`,
          to: getPageUrl(route.to, { params: { id: resource?.id } }),
        };
      }
      if (route.label === 'inventory' && isInventorySource) {
        return {
          label: `${inventory?.name}`,
          to: getPageUrl(route.to, { params: { id: inventory?.id } }),
        };
      }
      if (route.id === 'schedules') {
        return { label: route.label, to: getPageUrl(route.to, { params: { id: resource?.id } }) };
      }
      return { label: route.label, to: getPageUrl(route.to) };
    });

    return [...completedBreadcrumbs, { label: schedule?.name }];
  }, [
    getPageUrl,
    resource?.id,
    resource?.name,
    inventory?.id,
    inventory?.name,
    isInventorySource,
    props.initialBreadCrumbs,
    schedule?.name,
  ]);

  const relevantError = resourceError || error;
  const relevantRefresh = refresh ?? resourceRefresh;
  if (relevantError) {
    return <AwxError error={relevantError} handleRefresh={relevantRefresh} />;
  }
  if (!schedule || !resource) return <LoadingPage breadcrumbs tabs />;
  const tabParams: { id: string; schedule_id: string; [key: string]: string } = {
    id: schedule.summary_fields.unified_job_template.id.toString(),
    schedule_id: schedule.id.toString(),
  };
  if (isInventorySource && params.source_id) {
    tabParams.source_id = params.source_id;
    tabParams.inventory_type = 'inventory';
  }
  return (
    <PageLayout>
      <PageHeader
        title={schedule?.name}
        breadcrumbs={breadCrumbs}
        headerActions={
          <PageActions<Schedule>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={schedule}
          />
        }
      />

      <PageRoutedTabs backTab={props.backTab} tabs={props.tabs} params={params} />
    </PageLayout>
  );
}
