import useSWR from 'swr';
import { IAwxDashboardData } from '../../../frontend/awx/overview/AwxOverview';
import { AwxCountsCard } from '../../../frontend/awx/overview/cards/AwxCountsCard';
import { awxAPI } from '../../../frontend/awx/common/api/awx-utils';

export function PlatformCountsCard() {
  const { data, isLoading } = useSWR<IAwxDashboardData>(awxAPI`/dashboard/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  if (!data || isLoading) {
    return <></>;
  }
  return <AwxCountsCard data={data} />;
}
