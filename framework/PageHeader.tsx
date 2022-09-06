import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Flex,
    FlexItem,
    PageSection,
    PageSectionVariants,
    Popover,
    Skeleton,
    Text,
    Title,
    Truncate,
} from '@patternfly/react-core'
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { CSSProperties, Fragment, ReactNode } from 'react'
import { useHistory } from 'react-router-dom'
import { useWindowSizeOrLarger, WindowSize } from './components/useBreakPoint'
import { useSettings } from './Settings'

export interface ICatalogBreadcrumb {
    id?: string
    label?: string
    to?: string
    target?: string
    component?: React.ElementType
}

function Breadcrumbs(props: { breadcrumbs: ICatalogBreadcrumb[]; style?: CSSProperties }) {
    const history = useHistory()
    if (!props.breadcrumbs) return <Fragment />
    return (
        <Breadcrumb style={props.style}>
            {props.breadcrumbs.map((breadcrumb) => {
                if (!breadcrumb.label) return <></>
                return (
                    <BreadcrumbItem
                        id={breadcrumb.id}
                        key={breadcrumb.id ?? breadcrumb.label}
                        component={breadcrumb.component}
                        onClick={breadcrumb.to ? () => history.push(breadcrumb.to) : undefined}
                        style={{
                            color: breadcrumb.to ? 'var(--pf-c-breadcrumb__link--Color)' : undefined,
                            cursor: breadcrumb.to ? 'pointer' : undefined,
                        }}
                        isActive={breadcrumb.to === undefined}
                    >
                        {breadcrumb.label}
                    </BreadcrumbItem>
                )
            })}
        </Breadcrumb>
    )
}

export interface PageHeaderProps {
    breadcrumbs?: ICatalogBreadcrumb[]
    title?: string
    titleHelpTitle?: string
    titleHelp?: ReactNode
    description?: string
    controls?: ReactNode
    pageActions?: ReactNode
}

export function PageHeader(props: PageHeaderProps) {
    const { breadcrumbs, title, description, controls, pageActions } = props
    const xl = useWindowSizeOrLarger(WindowSize.xl)
    const isSmOrLarger = useWindowSizeOrLarger(WindowSize.sm)
    const settings = useSettings()
    return (
        <PageSection
            variant={PageSectionVariants.light}
            style={{
                paddingTop: breadcrumbs ? (xl ? 16 : 12) : xl ? 24 : 16,
                paddingBottom: xl ? 24 : 16,
                borderBottom: settings.borders ? 'thin solid var(--pf-global--BorderColor--100)' : undefined,
            }}
        >
            <Flex flexWrap={{ default: 'nowrap' }} alignItems={{ default: 'alignItemsStretch' }}>
                <FlexItem grow={{ default: 'grow' }}>
                    {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} style={{ paddingBottom: xl ? 12 : 8 }} />}
                    <Fragment>
                        {title ? (
                            props.titleHelp ? (
                                <Popover headerContent={props.titleHelpTitle} bodyContent={props.titleHelp} position="bottom-start">
                                    <Title headingLevel="h1">
                                        {title}
                                        <Button variant="link" style={{ padding: 0, marginLeft: '8px', verticalAlign: 'top' }}>
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
                        {isSmOrLarger && description && (
                            <Text component="p" style={{ paddingTop: xl ? 4 : 2 }}>
                                <Truncate content={description} />
                            </Text>
                        )}
                    </Fragment>
                </FlexItem>
                {title && (pageActions || controls) && (
                    <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm', xl: 'spaceItemsMd' }}>
                        <FlexItem grow={{ default: 'grow' }}>{controls}</FlexItem>
                        {pageActions && <FlexItem>{pageActions}</FlexItem>}
                    </Flex>
                )}
            </Flex>
        </PageSection>
    )
}
