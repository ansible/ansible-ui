import useSWR from 'swr';
import { awxAPI } from '../../../frontend/awx/api/awx-utils';
import { IAwxDashboardData } from '../../../frontend/awx/dashboard/AwxDashboard';
import { AwxCountsCard } from '../../../frontend/awx/dashboard/cards/AwxCountsCard';

export function PlatformCountsCard() {
  const { data, isLoading } = useSWR<IAwxDashboardData>(awxAPI`/dashboard/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  if (!data || isLoading) {
    return <></>;
  }
  return <AwxCountsCard data={data} />;
}
