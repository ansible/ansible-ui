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
import { EmptyStateUnauthorized } from '../../../../framework/components/EmptyStateUnauthorized';
import { requestGet } from '../../../common/crud/Data';
import { TAGS } from './constants';
import useSWR from 'swr';
import AutomationCalculator from './AutomationCalculator';
import { ChartSchemaElement } from 'react-json-chart-builder';

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
  const { data, isLoading, error } = useSWR<ReportItemsResponse, boolean, any>(
    `/api/v2/analytics/report/automation_calculator/`,
    requestGet
  );

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
    if (error) {
      return <AnalyticsErrorState error={''} />;
    }
    if (!data) {
      return (
        <PageSection isFilled>
          <Bullseye>
            <Spinner />
          </Bullseye>
        </PageSection>
      );
    }
    if (data) {
      return <AutomationCalculator {...data?.report?.layoutProps} />;
    }
    return <EmptyStateUnauthorized />;
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
          <AnalyticsErrorState error={'no_credentials'} />
        ) : (
          <ReportsInternal />
        )}
      </PageLayout>
    </Page>
  );
}
