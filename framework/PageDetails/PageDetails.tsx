import { Alert, DescriptionList, PageSection } from '@patternfly/react-core';
import { ReactNode } from 'react';
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

  let component = (
    <PageSectionStyled variant="light" padding={{ default: 'noPadding' }}>
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
          ></Alert>
        ))}
      <DescriptionList
        orientation={{
          sm: orientation,
          md: orientation,
          lg: orientation,
          xl: orientation,
          '2xl': orientation,
        }}
        columnModifier={
          numberOfColumns === 'multiple'
            ? {
                default: '1Col',
                sm: '1Col',
                md: '2Col',
                lg: '2Col',
                xl: '3Col',
                '2xl': '3Col',
              }
            : numberOfColumns === 'two'
              ? {
                  default: '1Col',
                  sm: '1Col',
                  md: '2Col',
                  lg: '2Col',
                  xl: '3Col',
                  '2xl': '2Col',
                }
              : undefined
        }
        style={{ maxWidth: 1200, padding: disablePadding ? undefined : 24 }}
        isCompact={isCompact}
      >
        {props.children}
      </DescriptionList>
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
