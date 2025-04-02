import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { PageControls } from '../../../common/PageControls';
import { useScrollControls } from '@ansible/awx-ui/views/jobs/JobOutput/useScrollControls';
import { useVirtualizedList } from '../../..//common/utils/useVirtualized';
import { useEffect, useRef, useState } from 'react';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';
import { ActivationInstanceOutputRow } from './ActivationInstanceOutputRow';
import { useParams } from 'react-router-dom';
import { PageSection } from '@patternfly/react-core';
import styled from 'styled-components';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { useGet } from '@ansible/common-ui/crud/useGet';

const ScrollContainer = styled.div`
  overflow: auto;
  background-color: var(--pf-v5-global--BackgroundColor--100);
  font-size: var(--pf-v5-global--FontSize--sm);
  border-bottom: 1px solid var(--pf-v5-global--BorderColor--100);
`;

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 550px);
  padding: 24px;
  background-color: var(--pf-v5-global--BackgroundColor--100);
`;

export function ActivationInstanceEvents() {
  const [activationInstanceLog, setActivationInstanceLog] =
    useState<AwxItemsResponse<EdaActivationInstanceLog>>();

  const params = useParams<{ instanceId: string }>();

  const { data: activationInstanceLogInfo } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=1`
  );

  useEffect(() => {
    async function fetchData() {
      const activationInstanceLogOutput = await requestGet<
        AwxItemsResponse<EdaActivationInstanceLog>
      >(
        edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=${
          activationInstanceLogInfo?.count.toString() ?? '10'
        }`
      );

      setActivationInstanceLog(activationInstanceLogOutput);
    }

    void fetchData();
  }, [params.instanceId, activationInstanceLogInfo?.count]);

  const estimatedMaxLines = (activationInstanceLog?.results.length ?? 0) * 10;
  const outputLineChars = String(estimatedMaxLines).length;
  const containerRef = useRef<HTMLDivElement>(null);
  const { beforeRowsHeight, visibleItems, afterRowsHeight, setRowHeight } =
    useVirtualizedList<EdaActivationInstanceLog>(
      containerRef,
      activationInstanceLog?.results ?? []
    );

  const { scrollToTop, scrollToBottom, scrollPageDown, scrollPageUp } = useScrollControls(
    containerRef,
    false,
    () => {},
    activationInstanceLog?.results.length ?? 0,
    false
  );

  if (!activationInstanceLog?.results?.length) {
    return null;
  }
  return (
    <Section>
      <PageControls
        onScrollFirst={scrollToTop}
        onScrollLast={scrollToBottom}
        onScrollNext={scrollPageDown}
        onScrollPrevious={scrollPageUp}
        isFlatMode={true}
        isTemplateJob={false}
      />
      <ScrollContainer ref={containerRef}>
        <pre>
          <div
            className="output-grid"
            style={{ '--output-line-chars': outputLineChars } as { [key: string]: string | number }}
          >
            <div style={{ height: beforeRowsHeight }} />
            {visibleItems?.map((row) => (
              <ActivationInstanceOutputRow
                key={row.id}
                index={activationInstanceLog?.results.findIndex((r) => r.id === row.id) ?? 0}
                row={row}
                setHeight={setRowHeight}
              />
            ))}
            <div style={{ height: afterRowsHeight }} />
          </div>
        </pre>
      </ScrollContainer>
    </Section>
  );
}
