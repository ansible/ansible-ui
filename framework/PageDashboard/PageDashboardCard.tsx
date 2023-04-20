import { Card, CardHeader, Flex, FlexItem, Stack, Text, Title } from '@patternfly/react-core';
import { CSSProperties, ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Help } from '../components/Help';
import { PageDashboardContext } from './PageDashboard';

export type PageDashboardCardWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type PageDashboardCardHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type PageDashboardCardRows = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const heightUnit = 90;

export function PageDashboardCard(props: {
  supertitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  linkText?: string;
  to?: string;
  children?: ReactNode;

  /** Cards are in a grid layout with 12 columns. The width picks columns such that cards line up. */
  width?: PageDashboardCardWidth;

  /**
   * Cards are in a grid layout with rows.
   * The hight sets the height of the card.
   * Height also implies a default rows value.
   */
  height?: PageDashboardCardHeight;

  /*
   * Cards are in a grid layout with rows.
   * Rows indicates how many rows the card should span.
   * This is needed for wrapping of cards in the grid layout.
   */

  rows?: PageDashboardCardRows;
  style?: CSSProperties;
  help?: string[];
  helpTitle?: string;
  helpDocLink?: string;
  headerControls?: ReactNode;
}) {
  const dashboardContext = useContext(PageDashboardContext);

  let colSpan = 4;
  switch (props.width) {
    case 'xs':
      colSpan = 2;
      break;
    case 'sm':
      colSpan = 3;
      break;
    case 'md':
      colSpan = 4;
      break;
    case 'lg':
      colSpan = 6;
      break;
    case 'xl':
      colSpan = 8;
      break;
    case 'xxl':
      colSpan = 12;
      break;
  }

  if (colSpan > dashboardContext.columns) {
    colSpan = dashboardContext.columns;
  }

  let heightSpan = undefined;
  switch (props.height) {
    case 'xs':
      heightSpan = 2;
      break;
    case 'sm':
      heightSpan = 3;
      break;
    case 'md':
      heightSpan = 4;
      break;
    case 'lg':
      heightSpan = 6;
      break;
    case 'xl':
      heightSpan = 8;
      break;
    case 'xxl':
      heightSpan = 12;
      break;
  }

  const height = heightSpan ? heightUnit * heightSpan + 16 * (heightSpan - 1) : undefined;

  let rowSpan = heightSpan;

  switch (props.rows) {
    case 'xs':
      rowSpan = 2;
      break;
    case 'sm':
      rowSpan = 3;
      break;
    case 'md':
      rowSpan = 4;
      break;
    case 'lg':
      rowSpan = 6;
      break;
    case 'xl':
      rowSpan = 8;
      break;
    case 'xxl':
      rowSpan = 12;
      break;
  }

  return (
    <Card
      isFlat
      isRounded
      style={{
        transition: 'box-shadow 0.25s',
        gridColumn: `span ${colSpan}`,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        minHeight: height,
        maxHeight: height,
        ...props.style,
      }}
    >
      {props.title && (
        <CardHeader>
          <Stack style={{ width: '100%' }}>
            <Flex
              fullWidth={{ default: 'fullWidth' }}
              spaceItems={{ default: 'spaceItemsNone' }}
              alignItems={{ default: 'alignItemsFlexStart' }}
              justifyContent={{ default: 'justifyContentFlexEnd' }}
              style={{ columnGap: 24, rowGap: 8 }}
            >
              <FlexItem grow={{ default: 'grow' }}>
                <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                  <FlexItem>
                    <Stack>
                      {props.supertitle && (
                        <Text component="small" style={{ opacity: 0.8 }}>
                          {props.supertitle}
                        </Text>
                      )}
                      <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                        <Title headingLevel="h3" size="xl">
                          {props.title}
                        </Title>
                        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
                          <Help
                            help={props.help}
                            title={props.helpTitle}
                            docLink={props.helpDocLink}
                          />
                        </FlexItem>
                      </Flex>
                      {props.subtitle && (
                        <Text component="small" style={{ opacity: 0.8 }}>
                          {props.subtitle}
                        </Text>
                      )}
                    </Stack>
                  </FlexItem>
                </Flex>
              </FlexItem>
              {props.headerControls && <FlexItem>{props.headerControls}</FlexItem>}
              <FlexItem>
                <Text component="small">
                  {props.linkText && <Link to={props.to as string}>{props.linkText}</Link>}
                </Text>
              </FlexItem>
            </Flex>
            {props.description && (
              <span style={{ opacity: 0.8, paddingTop: 6 }}>{props.description}</span>
            )}
          </Stack>
        </CardHeader>
      )}
      {props.children}
    </Card>
  );
}
