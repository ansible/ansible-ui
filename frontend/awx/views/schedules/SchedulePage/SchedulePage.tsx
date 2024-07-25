import { DropdownPosition } from '@patternfly/react-core/deprecated';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageActions, PageHeader, PageLayout } from '../../../../../framework';
import { useGetPageUrl } from '../../../../../framework/PageNavigation/useGetPageUrl';
import { LoadingPage } from '../../../../../framework/components/LoadingPage';
import { useAbortController } from '../../../../../framework/hooks/useAbortController';
import { PageRoutedTabs } from '../../../../common/PageRoutedTabs';
import { requestGet } from '../../../../common/crud/Data';
import { useGetItem } from '../../../../common/crud/useGet';
import { useViewActivityStream } from '../../../access/common/useViewActivityStream';
import { AwxError } from '../../../common/AwxError';
import { awxAPI } from '../../../common/api/awx-utils';
import { Inventory } from '../../../interfaces/Inventory';
import { Schedule } from '../../../interfaces/Schedule';
import { AwxRoute } from '../../../main/AwxRoutes';
import { useGetScheduleUrl } from '../hooks/useGetScheduleUrl';
import { useSchedulesActions } from '../hooks/useSchedulesActions';
import { ScheduleResources, schedulePageUrl } from '../types';
import { INVENTORY_TYPE } from '../wizard/constants';
/**
 *
 * @param {{label:string, page:string}[]} tab - The page property in the page id that comes from AwxRoute
 * @param {{label: string; page: string; persistentFilterKey: string }} backTab
 * @param {{ label?: string; id?: string; to: string }[]} initialBreadCrumbs- We use this prop to build our the urls and
 * labels we need for the breadcrumbs
 * @param {string} resourceEndPoint - This is a url that is used to fetch the resource to which the schedule belongs.
 */
export function SchedulePage(props: {
  tabs: { label: string; page: string }[];
  backTab: { label: string; page: string; persistentFilterKey: string };
  initialBreadCrumbs: { label?: string; id?: string; to: string }[];
  resourceEndPoint: string;
}) {
  const viewActivityStreamAction = useViewActivityStream('schedule');

  const abortController = useAbortController();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const isInventorySource = props.initialBreadCrumbs.some(({ id }) => id === 'inventory_sources');

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
    `${props.resourceEndPoint}`,
    isInventorySource ? params.source_id : params.id
  );
  const getScheduleURL = useGetScheduleUrl();
  let urlId: {
    id: AwxRoute;
    params?: { id: string; schedule_id: string; source_id?: string; inventory_type?: string };
  } = { id: AwxRoute.Schedules };
  if (schedule) {
    const { pageId, params } = getScheduleURL('scheduleList', schedule) as schedulePageUrl;
    urlId = { id: pageId, params };
  }
  const itemActions = useSchedulesActions({
    onScheduleDeleteCompleted: () => navigate(getPageUrl(urlId.id, { params: urlId.params })),
    onScheduleToggleCompleted: refresh,
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
      const allParams = {
        id: isInventorySource ? inventory?.id : resource?.id,
        inventory_type: isInventorySource ? INVENTORY_TYPE : undefined,
        source_id: isInventorySource ? resource?.id : undefined,
      };

      if (route.id === 'data') {
        return {
          label: `${resource?.name}`,
          to: getPageUrl(route.to, {
            params: allParams,
          }),
        };
      }
      if (route.id === 'inventory' && isInventorySource) {
        return {
          label: `${inventory?.name}`,
          to: getPageUrl(route.to, {
            params: {
              id: inventory?.id,
              inventory_type: isInventorySource ? INVENTORY_TYPE : undefined,
              source_id: isInventorySource ? resource?.id : undefined,
            },
          }),
        };
      }
      if (route.id === 'schedules') {
        return {
          label: route.label,
          to: getPageUrl(route.to, {
            params: allParams,
          }),
        };
      }

      if (route.id === 'inventory_sources') {
        return {
          label: route.label,
          to: getPageUrl(route.to, {
            params: {
              id: inventory?.id,
              inventory_type: isInventorySource ? INVENTORY_TYPE : undefined,
            },
          }),
        };
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

  return (
    <PageLayout>
      <PageHeader
        title={schedule?.name}
        breadcrumbs={breadCrumbs}
        headerActions={
          <PageActions<Schedule>
            actions={[...viewActivityStreamAction, ...itemActions]}
            position={DropdownPosition.right}
            selectedItem={schedule}
          />
        }
      />
      <PageRoutedTabs backTab={props.backTab} tabs={props.tabs} params={params} />
    </PageLayout>
  );
}
