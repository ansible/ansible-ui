import { awxAPI } from '@ansible/awx-ui/common/api/awx-utils';
import { IAwxDashboardData } from '@ansible/awx-ui/overview/AwxOverview';
import { AwxCountsCard } from '@ansible/awx-ui/overview/cards/AwxCountsCard';
import useSWR from 'swr';

export function PlatformCountsCard() {
  const { data, isLoading } = useSWR<IAwxDashboardData>(awxAPI`/dashboard/`, (url: string) =>
    fetch(url).then((r) => r.json())
  );
  if (!data || isLoading) {
    return <></>;
  }
  return <AwxCountsCard data={data} />;
}
