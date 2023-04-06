import { PageHeader, PageLayout } from '../../../../framework';
import {
  Bullseye,
  Page,
  PageSection,
  Spinner,
  LabelGroup,
  Tooltip,
  TooltipPosition,
  Label,
} from '@patternfly/react-core';
import { AnalyticsErrorState } from './ErrorStates';
import { useActiveUser } from '../../../common/useActiveUser';
import { requestGet } from '../../../common/crud/Data';
import { TAGS } from './constants';
import useSWR from 'swr';
import AutomationCalculator from './AutomationCalculator';
import { ChartSchemaElement } from 'react-json-chart-builder';
import React, { useEffect, useState } from 'react';

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

export default function Reports() {
  const activeUser = useActiveUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, isLoading, error } = useSWR<ReportItemsResponse, boolean, any>(
    `/api/v2/analytics/report/automation_calculator/`,
    requestGet
  );
  const [specificError, setSpecificError] = useState<string>('');

  useEffect(() => {
    if (!error) {
      setSpecificError('');
    } else {
      // @ts-expect-error: Cannot override type coming from useSWR
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      error?.response
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .clone()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .json()
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        .then((r: { error?: { keyword?: string } }) =>
          setSpecificError(r?.error?.keyword || 'unknown')
        );
    }
  }, [error]);

  if (isLoading) {
    return (
      <PageSection isFilled>
        <Bullseye>
          <Spinner />
        </Bullseye>
      </PageSection>
    );
  }

  function ReportsInternal() {
    if (error || specificError) {
      return specificError ? <AnalyticsErrorState error={specificError} /> : <></>;
    } else {
      return data ? <AutomationCalculator {...data.report?.layoutProps} /> : <></>;
    }
  }

  const reportTags = (
    <LabelGroup numLabels={6}>
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
    </LabelGroup>
  );
  return (
    <Page>
      <PageLayout>
        <PageHeader
          title={data?.report?.name || ''}
          description={data?.report?.description || ''}
          footer={data ? reportTags : undefined}
        />
        {!(activeUser?.is_superuser || activeUser?.is_system_auditor) ? (
          <AnalyticsErrorState />
        ) : (
          <ReportsInternal />
        )}
      </PageLayout>
    </Page>
  );
}
