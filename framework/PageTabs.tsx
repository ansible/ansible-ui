import {
    Divider,
    Flex,
    FlexItem,
    PageSection,
    PageSectionTypes,
    Skeleton,
    Tab,
    Tabs,
} from '@patternfly/react-core'
import {
    Children,
    Dispatch,
    isValidElement,
    ReactNode,
    SetStateAction,
    useCallback,
    useState,
} from 'react'

export function PageTabs(props: {
    children: ReactNode
    preComponents?: ReactNode
    postComponents?: ReactNode
}) {
    const [activeKey, setActiveKey] = useState<number>(0)
    const onSelect = useCallback(
        (_, key: string | number) => setActiveKey(key as number),
        [setActiveKey]
    )
    const children = Children.toArray(props.children)
    const tabs = children.map((child, index) => {
        if (isValidElement(child)) {
            if (child.type === PageTab) {
                const title = (child.props as { title: string }).title
                return (
                    <Tab
                        key={title ?? index}
                        title={title ? title : <Skeleton width="60px" />}
                        eventKey={index}
                    />
                )
            }
        }
        return child
    })
    const content = children[activeKey]
    return (
        <>
            <PageSection type={PageSectionTypes.tabs}>
                <Flex spaceItems={{ default: 'spaceItemsNone' }}>
                    {props.preComponents && (
                        <>
                            <FlexItem
                            // style={{ paddingLeft: 16 }}
                            >
                                {props.preComponents}
                            </FlexItem>
                            <Divider orientation={{ default: 'vertical' }} component="div" />
                        </>
                    )}
                    <FlexItem grow={{ default: 'grow' }}>
                        <Tabs
                            activeKey={activeKey}
                            onSelect={onSelect}
                            inset={
                                props.preComponents
                                    ? undefined
                                    : {
                                          default: 'insetNone',
                                          sm: 'insetNone',
                                          md: 'insetNone',
                                          lg: 'insetNone',
                                          xl: 'insetSm',
                                          ['2xl']: 'insetSm',
                                      }
                            }
                            hasBorderBottom={false}
                        >
                            {tabs}
                        </Tabs>
                    </FlexItem>
                    {props.postComponents && (
                        <>
                            <Divider orientation={{ default: 'vertical' }} />
                            <FlexItem style={{ paddingRight: 16 }}>{props.postComponents}</FlexItem>
                        </>
                    )}
                </Flex>
            </PageSection>
            <Divider />
            {content}
        </>
    )
}

export function PageTab(props: { title?: string; children: ReactNode }) {
    return <>{props.children}</>
}

export function PageTabsOld(props: {
    activeKey: string | number
    setActiveKey: Dispatch<SetStateAction<string | number>>
    children: ReactNode
}) {
    const { activeKey, setActiveKey } = props
    const onSelect = useCallback((_, key: string | number) => setActiveKey(key), [setActiveKey])
    return (
        <PageSection type={PageSectionTypes.tabs} style={{ flexGrow: 1 }}>
            <Tabs
                activeKey={activeKey}
                onSelect={onSelect}
                inset={{
                    default: 'insetNone',
                    sm: 'insetNone',
                    md: 'insetNone',
                    lg: 'insetNone',
                    xl: 'insetSm',
                    ['2xl']: 'insetSm',
                }}
            >
                {props.children}
            </Tabs>
        </PageSection>
    )
}
