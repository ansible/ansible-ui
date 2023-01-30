import React, { useEffect, useState } from 'react';
import { Chart, ChartAxis, ChartLine, ChartTooltip } from '@patternfly/react-charts';

import chart_color_green_400 from '@patternfly/react-tokens/dist/js/chart_color_green_400';
import chart_color_red_300 from '@patternfly/react-tokens/dist/js/chart_color_red_300';
import { c_content_small_FontSize } from '@patternfly/react-tokens';
import { Card, CardBody, CardHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface TickType {
  x: string;
  y: number;
}

const ActionsChart = () => {
  const [width, setWidth] = useState(window.innerWidth);

  const { t } = useTranslation();

  const handleResize = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const calculateChartPoints = (data) => {
    const tickValues: string[] = [];
    data.forEach((item) => {
      const keyDate = new Date(item.fired_date);
      const key = `${keyDate.getMonth()}/${keyDate.getDate()}`;
      const idx = tickValues.findIndex((tick) => tick === key);
      if (idx < 0) {
        tickValues.push(key);
        if (item.status === 'successful') {
          successfulRuns.push({ x: key, y: 1 });
          failedRuns.push({ x: key, y: 0 });
        }
        if (item.status === 'failed') {
          failedRuns.push({ x: key, y: 1 });
          successfulRuns.push({ x: key, y: 0 });
        }
      } else {
        if (item.status === 'successful') {
          successfulRuns[idx].y = successfulRuns[idx].y + 1;
        }
        if (item.status === 'failed') {
          failedRuns[idx].y = failedRuns[idx].y + 1;
        }
      }
    });
  };

  const fetchChartData = () => {
    listActionsRules().then((data) => {
      calculateChartPoints(data?.data);
    });
  };

  const renderSuccessfulRulesFired = () => {
    const successPoints = successfulRuns.map((tick) => {
      return {
        x: tick.x,
        y: tick.y,
        name: 'Successful',
        label: `${tick.x} Successful: ${tick.y}`,
      };
    });
    return (
      <ChartLine
        data={successPoints}
        style={{
          data: { stroke: chart_color_green_400.value },
        }}
        labelComponent={<ChartTooltip constrainToVisibleArea />}
      />
    );
  };

  const renderFailedRulesFired = () => {
    const failedPoints = failedRuns.map((tick) => {
      return {
        x: tick.x,
        y: tick.y,
        name: 'Failed',
        label: `${tick.x} Failed: ${tick.y}`,
      };
    });
    return (
      <ChartLine
        data={failedPoints}
        style={{
          data: { stroke: chart_color_red_300.value },
        }}
        labelComponent={<ChartTooltip constrainToVisibleArea />}
      />
    );
  };

  const getTickValues = () => {
    const tickValues: string[] = [];
    successfulRuns.forEach((item) => tickValues.push(item.x));
    return tickValues;
  };

  const yAxisStyles = {
    tickLabels: {
      fontSize: 10,
    },
    axisLabel: {
      padding: 45,
      fontSize: c_content_small_FontSize.value,
    },
  };

  const xAxisStyles = {
    tickLabels: {
      fontSize: 10,
    },
    axisLabel: {
      padding: 30,
      fontSize: c_content_small_FontSize.value,
    },
  };
  return (
    <Card>
      <CardHeader>{t('Rules over time')}</CardHeader>
      <CardBody>
        <Chart
          ariaDesc="Rules over time"
          ariaTitle="Rules over time"
          domainPadding={{ x: [30, 25] }}
          height={225}
          padding={{
            bottom: 60,
            left: 60,
            right: 20,
            top: 20,
          }}
          width={width}
        >
          <ChartAxis
            tickValues={getTickValues()}
            fixLabelOverlap
            label={t('Time')}
            style={xAxisStyles}
          />
          <ChartAxis
            dependentAxis
            showGrid
            domain={[0, 3]}
            tickFormat={(tick) => Math.round(tick)}
            style={yAxisStyles}
            label={t('Rules fired')}
          />
          {successfulRuns && renderSuccessfulRulesFired()}
          {failedRuns && renderFailedRulesFired()}
        </Chart>
      </CardBody>
    </Card>
  );
};

export default ActionsChart;
