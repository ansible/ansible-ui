import useSWR from 'swr';
import { awxAPI } from '../../../cypress/support/formatApiPathForAwx';
import { IAwxDashboardData } from '../../../frontend/awx/overview/AwxOverview';
import { AwxCountsCard } from '../../../frontend/awx/overview/cards/AwxCountsCard';

export function PlatformCountsCard() {
  const { data, isLoading } = useSWR<IAwxDashboardData>(awxAPI`/dashboard/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  if (!data || isLoading) {
    return <></>;
  }
  return <AwxCountsCard data={data} />;
}
