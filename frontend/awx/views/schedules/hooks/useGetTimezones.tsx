import { useGet } from '@ansible/common-ui/crud/useGet';
import { useMemo } from 'react';
import { awxAPI } from '../../../common/api/awx-utils';
export function useGetTimezones() {
  const { data } = useGet<{ zones: string[]; links: Record<string, string> }>(
    awxAPI`/schedules/zoneinfo/`
  );
  const timeZones = useMemo(
    () =>
      (data?.zones || []).map((zone) => ({
        value: zone,
        key: zone,
        label: zone,
      })),
    [data?.zones]
  );
  return { timeZones, links: data?.links };
}
