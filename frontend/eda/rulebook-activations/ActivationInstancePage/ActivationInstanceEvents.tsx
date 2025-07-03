import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { PageControls } from '../../../common/PageControls';
import { useScrollControls } from '@ansible/awx-ui/views/jobs/JobOutput/useScrollControls';
import { useVirtualizedList } from '../../..//common/utils/useVirtualized';
import { useEffect, useRef, useState } from 'react';
import { edaAPI } from '../../common/eda-utils';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';
import { ActivationInstanceOutputRow } from './ActivationInstanceOutputRow';
import { useParams } from 'react-router';
import { PageSection } from '@patternfly/react-core';
import styled from 'styled-components';
import { requestGet } from '@ansible/common-ui/crud/Data';
import { IFilterState, IToolbarFilter } from '@ansible/ansible-ui-framework';
import { useGet } from '@ansible/common-ui/crud/useGet';
import { getFiltersQueryString } from '../../../awx/views/jobs/JobOutput/useJobOutput';

const ScrollContainer = styled.div`
  overflow: auto;
  background-color: var(--pf-t--global--background--color--primary--default);
  font-size: var(--pf-t--global--font--size--body--sm);
  border-bottom: 1px solid var(--pf-t--global--border--color--default);
`;

const Section = styled(PageSection)`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 550px);
  padding: 0px 24px 24px 24px;
  background-color: var(--pf-t--global--background--color--primary--default);
`;

interface IActivationInstanceEventsProps {
  toolbarFilters: IToolbarFilter[];
  filterState: IFilterState;
  isFollowModeEnabled: boolean;
  setIsFollowModeEnabled: (isFollowModeEnabled: boolean) => void;
  isRunning: boolean;
}

export function ActivationInstanceEvents(props: IActivationInstanceEventsProps) {
  const [activationInstanceLog, setActivationInstanceLog] =
    useState<AwxItemsResponse<EdaActivationInstanceLog>>();

  const params = useParams<{ instanceId: string }>();
  const { toolbarFilters, filterState, isFollowModeEnabled, setIsFollowModeEnabled, isRunning } =
    props;

  const { data: activationInstanceLogInfo } = useGet<AwxItemsResponse<EdaActivationInstanceLog>>(
    edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/?page_size=1`
  );

  useEffect(() => {
    async function fetchData() {
      const filterString = getFiltersQueryString(toolbarFilters, filterState);
      const qsParts = [`page_size=${activationInstanceLogInfo?.count.toString() ?? '10'}`];
      if (filterString) {
        qsParts.push(filterString);
      }
      const activationInstanceLogOutput = await requestGet<
        AwxItemsResponse<EdaActivationInstanceLog>
      >(
        edaAPI`/activation-instances/${params.instanceId ?? ''}/logs/`.concat(
          `?${qsParts.join('&')}`
        )
      );

      setActivationInstanceLog(activationInstanceLogOutput);
    }

    void fetchData();
  }, [params.instanceId, activationInstanceLogInfo?.count, toolbarFilters, filterState]);

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
    isFollowModeEnabled,
    setIsFollowModeEnabled,
    activationInstanceLog?.results.length ?? 0,
    isRunning
  );

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
