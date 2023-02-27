import { useTranslation } from 'react-i18next';
import { pfSuccess } from '../../../../framework';
import { PageDashboardDonutCard } from '../../../../framework/PageDashboard/PageDonutChart';
import { RouteObj } from '../../../Routes';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';

export function DashboardExecutionEnvironments(props: {
  executionEnvironments: { results?: ExecutionEnvironment[] | undefined } | undefined;
}) {
  const { t } = useTranslation();
  const { executionEnvironments } = props;

  if (!executionEnvironments?.results) {
    return <></>;
  }

  return (
    <PageDashboardDonutCard
      title={t('Execution environments')}
      to={RouteObj.ExecutionEnvironments}
      items={[
        {
          label: t('Ready'),
          count: executionEnvironments?.results?.length ?? 0,
          color: pfSuccess,
        },
      ]}
    />
  );
}
