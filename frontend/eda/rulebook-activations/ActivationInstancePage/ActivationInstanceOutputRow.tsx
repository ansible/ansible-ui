/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Ansi } from '@ansible/common-ui/Ansi';
import { Label } from '@patternfly/react-core';
import useResizeObserver from '@react-hook/resize-observer';
import { useRef } from 'react';
import styled from 'styled-components';
import './ActivationInstancePage.css';
import { EdaActivationInstanceLog } from '../../interfaces/EdaActivationInstanceLog';

const LineNumberGutter = styled.div`
  position: sticky;
  left: 0px;
  display: flex;
  gap: 8px;
  padding-block: 2px;
  padding-inline: 8px;
  border-right: 1px solid var(--pf-v5-global--BorderColor--100);
  background-color: var(--pf-v5-global--BackgroundColor--200);
  z-index: 1;

  .pf-v5-theme-dark & {
    background-color: var(--pf-v5-global--BackgroundColor--100);
  }
`;
const LineNumber = styled.div`
  flex: 1;
  text-align: right;
  user-select: none;
`;
const StdOutColumn = styled.div`
  padding-block: 2px;
  padding-inline: 16px;
`;
const TimestampColumn = styled.div`
  user-select: none;
`;

export function ActivationInstanceOutputRow(props: {
  index: number;
  row: EdaActivationInstanceLog;
  setHeight: (index: number, height: number) => void;
}) {
  const { index, row } = props;
  const ref = useRef<HTMLTableRowElement>(null);
  useResizeObserver(ref, () => props.setHeight(index, ref.current?.clientHeight ?? 0));

  return (
    <div className="output-grid-row" style={{ cursor: 'auto' }} ref={ref}>
      <LineNumberGutter>
        <LineNumber>{index + 1}</LineNumber>
      </LineNumberGutter>
      <StdOutColumn>
        <Ansi input={row.log} />
      </StdOutColumn>
      <TimestampColumn>
        <Label isCompact>
          {new Date(row.log_timestamp ? row.log_timestamp * 1000 : '').toLocaleTimeString()}
        </Label>
      </TimestampColumn>
    </div>
  );
}
