import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@patternfly/react-core';
import {
  AngleDoubleUpIcon,
  AngleDoubleDownIcon,
  AngleUpIcon,
  AngleDownIcon,
  AngleRightIcon,
} from '@patternfly/react-icons';
import styled from 'styled-components';

const ControllsWrapper = styled.div`
  display: flex;
  height: 35px;
  border: 1px solid #d7d7d7;
  width: 100%;
  justify-content: space-between;
`;

const ScrollWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;
const ExpandCollapseWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  & > Button {
    padding-left: 8px;
  }
`;

interface IPageControlsProps {
  onScrollFirst: () => void;
  onScrollLast: () => void;
  onScrollNext: () => void;
  onScrollPrevious: () => void;
  toggleExpandCollapseAll: () => void;
  isAllCollapsed: boolean;
  isFlatMode: boolean;
  isTemplateJob: boolean;
}

export function PageControls(props: IPageControlsProps) {
  const {
    onScrollFirst,
    onScrollLast,
    onScrollNext,
    onScrollPrevious,
    toggleExpandCollapseAll,
    isAllCollapsed,
    isFlatMode,
    isTemplateJob,
  } = props;
  const { t } = useTranslation();

  return (
    <ControllsWrapper>
      <ExpandCollapseWrapper>
        {!isFlatMode && isTemplateJob && (
          <Button
            aria-label={isAllCollapsed ? t`Expand job events` : t`Collapse all job events`}
            variant="plain"
            type="button"
            onClick={toggleExpandCollapseAll}
          >
            {isAllCollapsed ? <AngleRightIcon /> : <AngleDownIcon />}
          </Button>
        )}
      </ExpandCollapseWrapper>
      <ScrollWrapper>
        <Button
          ouiaId="job-output-scroll-previous-button"
          aria-label={t`Scroll previous`}
          onClick={onScrollPrevious}
          variant="plain"
        >
          <AngleUpIcon />
        </Button>
        <Button
          ouiaId="job-output-scroll-next-button"
          aria-label={t`Scroll next`}
          onClick={onScrollNext}
          variant="plain"
        >
          <AngleDownIcon />
        </Button>
        <Button
          ouiaId="job-output-scroll-first-button"
          aria-label={t`Scroll first`}
          onClick={onScrollFirst}
          variant="plain"
        >
          <AngleDoubleUpIcon />
        </Button>
        <Button
          ouiaId="job-output-scroll-last-button"
          aria-label={t`Scroll last`}
          onClick={onScrollLast}
          variant="plain"
        >
          <AngleDoubleDownIcon />
        </Button>
      </ScrollWrapper>
    </ControllsWrapper>
  );
}
