import { PageHeader, PageLayout } from '@ansible/ansible-ui-framework';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGetDocsUrl } from '@ansible/common-ui/utils/useGetDocsUrl';
import { ChartSchemaElement } from '@ansible/react-json-chart-builder';
import { Label, LabelGroup, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';
import { awxAPI } from '../../common/api/awx-utils';
import { useAwxActiveUser } from '../../common/useAwxActiveUser';
import { useAwxConfig } from '../../common/useAwxConfig';
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
  const config = useAwxConfig();

  useEffect(() => {
    if (!error) {
      setSpecificError('');
    } else {
      // @ts-expect-error: Cannot override type coming from useSWR
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      setSpecificError(error?.body?.error?.keyword || 'unknown');
    }
  }, [error]);

  const reportsInternal = useMemo(
    () => <ReportsInternal error={error} specificError={specificError} data={data} />,
    [error, specificError, data]
  );

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
    <PageLayout>
      <PageHeader
        title={data?.report?.name || ''}
        description={data?.report?.description || ''}
        controls={data ? reportTags : undefined}
        titleHelp={data?.report?.description || ''}
        titleHelpTitle={data?.report?.name || ''}
        titleDocLink={useGetDocsUrl(config, 'automationCalculator')}
      />
      {activeAwxUser && !activeAwxUser?.is_superuser ? <AnalyticsErrorState /> : reportsInternal}
    </PageLayout>
  );
}

const ReportTagsLabelGroup = styled(LabelGroup)`
  flex-wrap: nowrap;
`;

function ReportsInternal(props: {
  error?: Error;
  specificError?: string;
  data?: ReportItemsResponse;
}) {
  const { error, specificError, data } = props;
  if (error || specificError) {
    return specificError ? <AnalyticsErrorState error={specificError} /> : <></>;
  } else {
    return data ? <AutomationCalculator {...data.report?.layoutProps} /> : <></>;
  }
}
