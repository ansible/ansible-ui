import { Alert, DescriptionList, PageSection } from '@patternfly/react-core';
import ResizeObserver from 'rc-resize-observer';
import { ReactNode, useCallback, useState } from 'react';
import styled from 'styled-components';
import { usePageSettings } from '../PageSettings/PageSettingsProvider';
import { Scrollable } from '../components/Scrollable';

export function PageDetails(props: {
  children?: ReactNode;
  disablePadding?: boolean;
  numberOfColumns?: 'multiple' | 'single' | 'two';
  labelOrientation?: 'horizontal' | 'vertical';
  alertPrompts?: string[];
  isCompact?: boolean;
  disableScroll?: boolean;
}) {
  const { disablePadding, alertPrompts } = props;
  const settings = usePageSettings();
  const orientation = props.labelOrientation ?? settings.formLayout;
  const numberOfColumns = props.numberOfColumns ? props.numberOfColumns : settings.formColumns;
  const isCompact = props.isCompact;

  const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');
  const onResize = useCallback(
    ({ width }: { width: number }) => {
      let columns = Math.max(1 + Math.floor((width - 350) / (350 + 24)), 1);
      if (columns < 1) columns = 1;
      switch (numberOfColumns) {
        case 'multiple':
          break;
        case 'two':
          columns = Math.min(columns, 2);
          break;
        default:
          columns = 1;
      }
      switch (orientation) {
        case 'horizontal':
          columns = 1;
          break;
      }
      setGridTemplateColumns(() => new Array(columns).fill('1fr').join(' '));
    },
    [numberOfColumns, orientation]
  );

  let component = (
    <PageSectionStyled padding={{ default: 'noPadding' }}>
      {alertPrompts &&
        alertPrompts.length > 0 &&
        alertPrompts.map((alertPrompt, i) => (
          <Alert
            style={{ margin: 12 }}
            isInline
            title={alertPrompt}
            variant="warning"
            key={i}
            data-cy={alertPrompt}
          />
        ))}
      <ResizeObserver onResize={onResize}>
        <DescriptionList
          style={{
            padding: disablePadding ? undefined : 24,
            gridTemplateColumns,
          }}
          isCompact={isCompact}
        >
          {props.children}
        </DescriptionList>
      </ResizeObserver>
    </PageSectionStyled>
  );
  if (!props.disableScroll) {
    component = <Scrollable>{component}</Scrollable>;
  }
  return component;
}

const PageSectionStyled = styled(PageSection)`
  background-color: transparent;
`;
