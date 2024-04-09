import { ChartSchemaElement } from '@ansible/react-json-chart-builder';
import { Label, LabelGroup, Page, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { PageHeader, PageLayout } from '../../../../framework';
import { requestGet } from '../../../common/crud/Data';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { AutomationCalculator } from './AutomationCalculator';
import { AnalyticsErrorState } from './ErrorStates';
import { TAGS } from './constants';

export interface ReportItemsResponse {
  report: {
    name: string;
    description: string;
    layoutProps: {
      schema: ChartSchemaElement[];
      tags: unknown[];
    };
  };
}

export function Reports() {
  const { activeAwxUser } = useAwxActiveUser();
  const { data, error } = useSWR<ReportItemsResponse, Error>(
    awxAPI`/analytics/report/automation_calculator/`,
    requestGet
  );
  const [specificError, setSpecificError] = useState<string>('');

  useEffect(() => {
    if (!error) {
      setSpecificError('');
    } else {
      // @ts-expect-error: Cannot override type coming from useSWR
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      setSpecificError(error?.body?.error?.keyword || 'unknown');
    }
  }, [error]);

  function ReportsInternal() {
    if (error || specificError) {
      return specificError ? <AnalyticsErrorState error={specificError} /> : <></>;
    } else {
      return data ? <AutomationCalculator {...data.report?.layoutProps} /> : <></>;
    }
  }

  const reportTags = (
    <ReportTagsLabelGroup numLabels={6}>
      {!!data &&
        data.report.layoutProps.tags.map((tagKey, idx) => {
          const tag = TAGS.find((t) => t.key === tagKey);
          if (tag) {
            return (
              <Tooltip
                key={`tooltip_${idx}`}
                position={TooltipPosition.bottom}
                content={tag.description}
              >
                <Label data-cy={tag.name} key={idx}>
                  {tag.name}
                </Label>
              </Tooltip>
            );
          }
        })}
    </ReportTagsLabelGroup>
  );
  return (
    <Page>
      <PageLayout>
        <PageHeader
          title={data?.report?.name || ''}
          description={data?.report?.description || ''}
          controls={data ? reportTags : undefined}
        />
        {activeAwxUser && !activeAwxUser?.is_superuser ? (
          <AnalyticsErrorState />
        ) : (
          <ReportsInternal />
        )}
      </PageLayout>
    </Page>
  );
}

const ReportTagsLabelGroup = styled(LabelGroup)`
  flex-wrap: nowrap;
`;
