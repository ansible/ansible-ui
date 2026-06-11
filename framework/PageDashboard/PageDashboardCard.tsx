import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { AngleRightIcon } from '@patternfly/react-icons';
import { CSSProperties, ReactNode, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Help } from '../components/Help';
import { useID } from '../hooks/useID';
import { PageDashboardContext } from './PageDashboard';

export type PageDashboardCardWidth = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type PageDashboardCardHeight = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const heightUnit = 90;

export function PageDashboardCard(props: {
  id?: string;
  supertitle?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  linkText?: string;
  to?: string;
  children?: ReactNode;
  footerActionButton?: {
    icon?: ReactNode;
    title: string;
    onClick: () => void;
  };

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
  help?: string;
  helpTitle?: string;
  helpDocLink?: string;
  headerControls?: ReactNode;

  isCompact?: boolean;

  canCollapse?: boolean;

  disableBodyPadding?: boolean;
}) {
  const id = useID(props);

  const dashboardContext = useContext(PageDashboardContext);

  let colSpan = {
    xxs: 3,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  }[props.width || 'md'];
  if (colSpan > dashboardContext.columns) {
    colSpan = dashboardContext.columns;
  }

  const [isCollapsed, setCollapsedState] = useState(
    localStorage.getItem('db-' + id + '-collapsed') === 'true'
  );
  const setCollapsed = (collapsed: boolean) => {
    setCollapsedState(collapsed);
    localStorage.setItem('db-' + id + '-collapsed', collapsed ? 'true' : 'false');
  };

  let heightSpan = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 6,
    xl: 8,
    xxl: 12,
    none: undefined,
  }[props.height || 'none'];

  if (isCollapsed) heightSpan = undefined;

  const height = heightSpan ? heightUnit * heightSpan + 16 * (heightSpan - 1) : undefined;

  let rowSpan = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 6,
    xl: 8,
    xxl: 12,
    none: heightSpan,
  }[props.height || 'none'];

  if (isCollapsed) rowSpan = undefined;

  const minHeight = rowSpan ? heightUnit * rowSpan + 16 * (rowSpan - 1) : undefined;

  return (
    <Card
      id={id}
      style={{
        transition: 'box-shadow 0.25s',
        gridColumn: `span ${colSpan}`,
        gridRow: rowSpan ? `span ${rowSpan}` : undefined,
        minHeight,
        maxHeight: height,
        maxWidth: '100%',
        ...props.style,
      }}
      isCompact={props.isCompact}
      className="page-dashboard-card"
      data-cy={id}
      data-testid={id}
      // variant="secondary"
    >
      {(props.title || props.linkText) && (
        <CardHeader>
          <Flex
            spaceItems={{ default: 'spaceItemsLg' }}
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentFlexEnd' }}
          >
            <FlexItem grow={{ default: 'grow' }}>
              {props.supertitle && (
                <Content
                  data-cy="card-main"
                  data-testid="card-main"
                  component="small"
                  style={{ opacity: 0.8 }}
                >
                  {props.supertitle}
                </Content>
              )}
              <div>
                <Title
                  data-cy="card-title"
                  data-testid="card-title"
                  headingLevel="h3"
                  size="xl"
                  style={{ display: 'inline-block', verticalAlign: '-0.15em', lineHeight: '1.2' }}
                >
                  {props.title}
                </Title>
                <Help help={props.help} title={props.helpTitle} docLink={props.helpDocLink} />
              </div>
              {props.subtitle && (
                <Content
                  data-cy="card-subtitle"
                  data-testid="card-subtitle"
                  component="small"
                  style={{ opacity: 0.8 }}
                >
                  {props.subtitle}
                </Content>
              )}
            </FlexItem>
            {props.headerControls && <FlexItem>{props.headerControls}</FlexItem>}
            <FlexItem>
              <Content data-cy="card-link-text" data-testid="card-link-text" component="small">
                {props.linkText && <Link to={props.to as string}>{props.linkText}</Link>}
              </Content>
            </FlexItem>
            {props.canCollapse && (
              <FlexItem>
                <AngleRightIcon
                  style={{
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                    transition: 'transform',
                  }}
                  onClick={() => setCollapsed(!isCollapsed)}
                />
              </FlexItem>
            )}
          </Flex>
          {props.description && !isCollapsed && (
            <span style={{ opacity: 0.8, paddingTop: 6 }}>{props.description}</span>
          )}
        </CardHeader>
      )}
      {!isCollapsed && props.children && (
        <CardBody style={{ padding: props.disableBodyPadding ? 0 : undefined }}>
          {props.children}
        </CardBody>
      )}
      {!isCollapsed && props.footerActionButton && (
        <CardFooter style={{ textAlign: 'end' }}>
          <Button
            variant="link"
            icon={props.footerActionButton.icon ? props.footerActionButton.icon : null}
            onClick={() => {
              void props.footerActionButton?.onClick();
            }}
          >
            {props.footerActionButton.title}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
