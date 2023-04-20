import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { compareStrings, pfDanger, pfSuccess } from '../../../../framework';
import { PageDashboardCard } from '../../../../framework/PageDashboard/PageDashboardCard';
import { PageDashboardChart } from '../../../../framework/PageDashboard/PageDashboardChart';
import { RouteObj } from '../../../Routes';
import { useGet } from '../../../common/crud/useGet';
import { API_PREFIX } from '../../constants';
import { EdaResult } from '../../interfaces/EdaResult';
import { EdaRuleAudit } from '../../interfaces/EdaRuleAudit';

const RuleAuditChart = () => {
  const { t } = useTranslation();

  const { data } = useGet<EdaResult<EdaRuleAudit>>(`${API_PREFIX}/audit-rules/`);

  // Chart Test Code
  // const generateRandomEdaRuleAudits = useCallback(
  //   () =>
  //     new Array(2000).fill(0).map((_, id) => ({
  //       id,
  //       status: Math.random() > 0.5 ? 'successful' : 'failed',
  //       fired_at: new Date(
  //         Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)
  //       ).toISOString(),
  //     })),
  //   []
  // );
  // const results = useMemo(() => generateRandomEdaRuleAudits(), [generateRandomEdaRuleAudits]);
  // data = { count: results.length, results };

  const { successfulRuns, failedRuns } = useMemo(() => {
    const successfulRunMap: { [label: string]: { label: string; value: number } } = {};
    const failedRunMap: { [label: string]: { label: string; value: number } } = {};
    if (data) {
      let firstDate: Date | undefined = undefined;
      let lastDate: Date = new Date(Date.now());
      for (const item of data.results ?? []) {
        if (item.fired_at) {
          const firedAtDate = new Date(item.fired_at);
          if (!firstDate || firedAtDate < firstDate) firstDate = firedAtDate;
          const label = `${firedAtDate.getMonth() + 1}/${firedAtDate.getDate()}`;
          switch (item.status) {
            case 'successful':
              {
                let run = successfulRunMap[label];
                if (!run) {
                  run = { label, value: 0 };
                  successfulRunMap[label] = run;
                }
                run.value++;
              }
              break;
            case 'failed':
              {
                let run = failedRunMap[label];
                if (!run) {
                  run = { label, value: 0 };
                  failedRunMap[label] = run;
                }
                run.value++;
              }
              break;
          }
        }
      }

      if (firstDate) {
        firstDate = new Date(
          firstDate.getUTCFullYear(),
          firstDate.getUTCMonth(),
          firstDate.getUTCDate()
        );
      }
      if (lastDate) {
        lastDate = new Date(
          lastDate.getUTCFullYear(),
          lastDate.getUTCMonth(),
          lastDate.getUTCDate()
        );
      }

      if (firstDate) {
        for (
          let date = firstDate;
          date <= lastDate;
          date = new Date(date.valueOf() + 24 * 60 * 60 * 1000)
        ) {
          const label = `${date.getMonth() + 1}/${date.getDate()}`;
          const successfulRun = successfulRunMap[label];
          if (!successfulRun) successfulRunMap[label] = { label, value: 0 };
          const failedRun = failedRunMap[label];
          if (!failedRun) failedRunMap[label] = { label, value: 0 };
        }
      }
    }

    const successfulRuns = Object.values(successfulRunMap).sort((l, r) =>
      compareStrings(l.label, r.label)
    );

    const failedRuns = Object.values(failedRunMap).sort((l, r) => compareStrings(l.label, r.label));

    return { successfulRuns, failedRuns };
  }, [data]);

  if (successfulRuns.length <= 1) {
    return <></>;
  }

  return (
    <PageDashboardCard title={t('Rule runs')} width="xxl" height="sm" to={RouteObj.EdaRules}>
      <PageDashboardChart
        groups={[
          { color: pfSuccess, values: successfulRuns },
          { color: pfDanger, values: failedRuns },
        ]}
      />
    </PageDashboardCard>
  );
};

export default RuleAuditChart;
