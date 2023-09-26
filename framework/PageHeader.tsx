import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Flex,
  FlexItem,
  PageNavigation,
  PageSection,
  PageSectionVariants,
  Popover,
  Skeleton,
  Stack,
  StackItem,
  Text,
  Title,
  Truncate,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { CSSProperties, Fragment, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import './PageFramework.css';
import { usePageNavSideBar } from './PageNavigation/PageNavSidebar';
import { useBreakpoint } from './components/useBreakPoint';
import { useFrameworkTranslations } from './useFrameworkTranslations';

export interface ICatalogBreadcrumb {
  id?: string;
  label?: string | null;
  to?: string;
  target?: string;
  component?: React.ElementType;
}

function Breadcrumbs(props: { breadcrumbs: ICatalogBreadcrumb[]; style?: CSSProperties }) {
  const navigate = useNavigate();
  if (!props.breadcrumbs) return <Fragment />;
  return (
    <Breadcrumb style={props.style}>
      {props.breadcrumbs.map((breadcrumb, index) => {
        if (!breadcrumb.label) return <Fragment key={index}></Fragment>;
        return (
          <BreadcrumbItem
            data-cy={breadcrumb.label}
            id={breadcrumb.id}
            key={breadcrumb.id ?? breadcrumb.label ?? index}
            component={breadcrumb.component}
            isActive={breadcrumb.to === undefined}
          >
            {breadcrumb.to ? (
              <a
                href={breadcrumb.to}
                data-cy={breadcrumb.label}
                onClick={(e) => {
                  e.preventDefault();
                  if (!breadcrumb.to) return;
                  navigate(breadcrumb.to);
                }}
              >
                {breadcrumb.label}
              </a>
            ) : (
              breadcrumb.label
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}

export interface PageHeaderProps {
  navigation?: ReactNode;
  breadcrumbs?: ICatalogBreadcrumb[];
  title?: string | null;
  titleHelpTitle?: string;
  titleHelp?: string | string[];
  titleDocLink?: string;
  description?: null | string | string[];
  controls?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
}

/**
 * PageHeader enables the responsive layout of the header.
 *
 * @param {Breadcrumb[]} breadcrumbs - The breadcrumbs for the page.
 * @param {string} title - The title of the page.
 * @param {string} titleHelpTitle - The title of help popover.
 * @param {ReactNode} titleHelp - The content for the help popover.
 * @param {string} description - The description of the page.
 * @param {ReactNode} controls - Support for extra page controls.
 * @param {ReactNode} headerActions - The actions for the page.
 * @param {ReactNode} footer - Extra components to render at the bottom of the header.
 *
 * @example
 * <PageLayout>
 *   <PageHeader
 *     breadcrumbs={[{ label: 'Home', to: '/home' }, { label: 'Page title' }]}
 *     title='Page title'
 *     description='Page description'
 *     headerActions={<TypedActions actions={actions} />}
 *   />
 *   ...
 * </PageLayout>
 */
export function PageHeader(props: PageHeaderProps) {
  const { breadcrumbs, title, description, controls, headerActions, footer } = props;
  const isLg = useBreakpoint('lg');
  const isXl = useBreakpoint('xl');
  const isMdOrLarger = useBreakpoint('md');
  const navBar = usePageNavSideBar();
  const navigation = navBar.isOpen && isXl ? undefined : props.navigation;
  const [translations] = useFrameworkTranslations();
  return (
    <>
      {navigation && (
        <PageSection
          variant={PageSectionVariants.light}
          className="dark-1 border-bottom"
          style={{ paddingLeft: 0, paddingTop: 0, paddingBottom: 0 }}
        >
          <Flex
            direction={{ default: 'row' }}
            flexWrap={{ default: 'nowrap' }}
            style={{ maxWidth: '100%' }}
          >
            <PageNavigation style={{ paddingTop: 0, flexShrink: 1, flexGrow: 1 }}>
              {navigation}
            </PageNavigation>
            {/* {!isMdOrLarger && props.titleDocLink && (
                            <FlexItem>
                                <Bullseye>
                                    <Button
                                        icon={<ExternalLinkAltIcon style={{ paddingRight: 4, paddingTop: 4 }} />}
                                        variant="link"
                                        onClick={() => window.open(props.titleDocLink, '_blank')}
                                        isInline
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {isSmLarger ? <span>{t('Documentation')}</span> : <span>{'Docs'}</span>}
                                    </Button>
                                </Bullseye>
                            </FlexItem>
                        )} */}
          </Flex>
        </PageSection>
      )}
      <PageSection
        variant={PageSectionVariants.light}
        className="border-bottom dark-2"
        style={{
          paddingTop: breadcrumbs ? (isXl ? 16 : 12) : isXl ? 16 : 12,
          paddingBottom: isXl ? 16 : 12,
        }}
      >
        <Stack hasGutter>
          <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsStretch' }}>
            <FlexItem grow={{ default: 'grow' }}>
              {breadcrumbs && (
                <Breadcrumbs breadcrumbs={breadcrumbs} style={{ paddingBottom: isLg ? 6 : 4 }} />
              )}
              {title ? (
                props.titleHelp ? (
                  <Popover
                    headerContent={props.titleHelpTitle}
                    bodyContent={
                      <Stack hasGutter>
                        {typeof props.titleHelp === 'string' ? (
                          <StackItem>{props.titleHelp}</StackItem>
                        ) : (
                          props.titleHelp.map((help, index) => (
                            <StackItem key={index}>{help}</StackItem>
                          ))
                        )}
                        {props.titleDocLink && (
                          <StackItem>
                            <Button
                              icon={<ExternalLinkAltIcon />}
                              variant="link"
                              onClick={() => window.open(props.titleDocLink, '_blank')}
                              isInline
                            >
                              {translations.documentation}
                            </Button>
                          </StackItem>
                        )}
                      </Stack>
                    }
                    position="bottom-start"
                    removeFindDomNode
                  >
                    <Title headingLevel="h1">
                      {title}
                      <Button
                        variant="link"
                        style={{
                          padding: 0,
                          marginTop: 1,
                          marginLeft: 8,
                          verticalAlign: 'top',
                        }}
                      >
                        <OutlinedQuestionCircleIcon />
                      </Button>
                    </Title>
                  </Popover>
                ) : (
                  <Title headingLevel="h1">{title}</Title>
                )
              ) : (
                <Title headingLevel="h1">
                  <Skeleton width="160px" />
                </Title>
              )}
              {isMdOrLarger && description && (
                <Text component="p" style={{ paddingTop: isXl ? 4 : 2, opacity: 0.8 }}>
                  {typeof description === 'string' ? (
                    <Truncate content={description} />
                  ) : (
                    <Stack>
                      {description.map((d) => (
                        <StackItem key={d}>{d}</StackItem>
                      ))}
                    </Stack>
                  )}
                </Text>
              )}
            </FlexItem>
            {title && (headerActions || controls) && (
              <Flex
                direction={{ default: 'column' }}
                spaceItems={{ default: 'spaceItemsSm', xl: 'spaceItemsMd' }}
                justifyContent={{ default: 'justifyContentCenter' }}
              >
                {controls && <FlexItem grow={{ default: 'grow' }}>{controls}</FlexItem>}
                {headerActions && <FlexItem>{headerActions}</FlexItem>}
              </Flex>
            )}
          </Flex>
          {footer}
        </Stack>
      </PageSection>
    </>
  );
}
