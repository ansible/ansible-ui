import { Card, CardHeader, Flex, FlexItem, Stack, Text, Title } from '@patternfly/react-core';
import { CSSProperties, ReactNode, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Help } from '../components/Help';
import { PageDashboardContext } from './PageDashboard';

export type PageDashboardCardWidth = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type PageDashboardCardHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const heightUnit = 90;

export function PageDashboardCard(props: {
  supertitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  linkText?: string;
  to?: string;
  children?: ReactNode;

  /**
   * Cards are in a grid layout with 12 columns.
   * The width picks columns such that cards line up.
   */
  width?: PageDashboardCardWidth;

  /**
   * Cards are in a grid layout with rows.
   * The height not only sets the minimum height, but also the rows that the card spans.
   * This is needed for wrapping of different size cards in the grid layout.
   */
  height?: PageDashboardCardHeight;

  /**
   * Max height limits the cards height.
   * Cards should have a scrollable area when this is enabled.
   */
  maxHeight?: PageDashboardCardHeight;

  style?: CSSProperties;
  help?: string[];
  helpTitle?: string;
  helpDocLink?: string;
  headerControls?: ReactNode;

  isCompact?: boolean;
}) {
  const dashboardContext = useContext(PageDashboardContext);

  let colSpan = 8;
  switch (props.width) {
    case 'xxs':
      colSpan = 3;
      break;
    case 'xs':
      colSpan = 4;
      break;
    case 'sm':
      colSpan = 6;
      break;
    case 'md':
      colSpan = 8;
      break;
    case 'lg':
      colSpan = 12;
      break;
    case 'xl':
      colSpan = 16;
      break;
    case 'xxl':
      colSpan = 24;
      break;
  }

  if (colSpan > dashboardContext.columns) {
    colSpan = dashboardContext.columns;
  }

  let heightSpan = undefined;
  switch (props.maxHeight) {
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

  switch (props.height) {
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

  const minHeight = rowSpan ? heightUnit * rowSpan + 16 * (rowSpan - 1) : undefined;

  return (
    <Card
      isFlat
      isRounded
      style={{
        transition: 'box-shadow 0.25s',
        gridColumn: `span ${colSpan}`,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        minHeight,
        maxHeight: height,
        ...props.style,
      }}
      isCompact={props.isCompact}
    >
      {(props.title || props.linkText) && (
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
