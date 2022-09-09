/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    Alert,
    Button,
    Card,
    CardActions,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    DescriptionList,
    DescriptionListDescription,
    DescriptionListGroup,
    DescriptionListTerm,
    Dropdown,
    DropdownItem,
    DropdownSeparator,
    KebabToggle,
    Label,
    LabelGroup,
    List,
    ListItem,
    PageSection,
    Popover,
    Split,
    SplitItem,
    Stack,
    StackItem,
    Title,
    Truncate,
} from '@patternfly/react-core'
import { ExternalLinkAltIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons'
import { Fragment, ReactNode, useCallback, useMemo, useState } from 'react'
import { Grid } from './components/Grid'
import { IconWrapper } from './components/IconWrapper'
import { Scrollable } from './components/Scrollable'
import { IItemAction, isItemActionClick } from './TypedActions'

type CatalogFilterValue = string

interface ICatalogFilterGroup {
    id: string
    label: string
    filters?: ICatalogFilter[]
}

interface ICatalogFilter {
    id?: string
    label?: string
    value: CatalogFilterValue
    filters?: ICatalogFilter[]
}

export function Catalog<T extends object>(props: {
    keyFn: (item: T) => string
    items: T[]
    itemToCardFn: (item: T) => ICatalogCard
    filterGroups?: ICatalogFilterGroup[]
    onBack?: () => void
    cardWidth?: number
    selectItem: (item: T) => void
    unselectItem: (item: T) => void
    isSelected: (item: T) => boolean
    itemActions?: IItemAction<T>[]
    showSelect: boolean
}) {
    const { keyFn, items, itemToCardFn, isSelected, selectItem, unselectItem, itemActions, showSelect } = props

    const catalogCards = useMemo(() => {
        return (
            <Grid size={props.cardWidth ?? 470}>
                {items.map((item) => (
                    <CatalogCard<T>
                        key={keyFn(item)}
                        item={item}
                        itemToCardFn={itemToCardFn}
                        isSelected={isSelected}
                        selectItem={selectItem}
                        unselectItem={unselectItem}
                        itemActions={itemActions}
                        showSelect={showSelect}
                    />
                ))}
            </Grid>
        )
    }, [props.cardWidth, items, keyFn, itemToCardFn, isSelected, selectItem, unselectItem, itemActions, showSelect])

    return (
        <PageSection style={{ flexGrow: 1 }}>
            {/* <Flex style={{ paddingBottom: 16 }}>
                <FlexItem>
                    <span style={{ paddingRight: 8 }}>
                        <b>Cards</b>
                    </span>
                    <Chip isReadOnly>{items.length}</Chip>
                </FlexItem>
                <FlexItem grow={{ default: 'grow' }} alignSelf={{ default: 'alignSelfCenter' }}>
                    <Divider />
                </FlexItem>
            </Flex> */}
            <div>{catalogCards}</div>
        </PageSection>
    )
}

export enum CatalogIconColor {
    'red' = 'red',
    'green' = 'green',
    'blue' = 'blue',
    'yellow' = 'yellow',
}

export enum CatalogColor {
    blue = 'blue',
    cyan = 'cyan',
    green = 'green',
    orange = 'orange',
    purple = 'purple',
    red = 'red',
    grey = 'grey',
}

export interface ICatalogCard {
    id: string
    icon?: ReactNode
    title: string
    items?: CatalogCardItem[]
    labels?: { label: string; color?: CatalogColor }[] // TODO - disable/enable auto generated filters
    learnMore?: string
    badge?: string
    badgeColor?: CatalogColor
    badgeTooltip?: string
    badgeTooltipTitle?: string
    alertTitle?: string
    alertContent?: ReactNode
    alertVariant?: 'success' | 'danger' | 'warning' | 'info' | 'default'
    onClick?: () => void
}

export interface ICatalogCardFeatureGroup {
    title: string
    features: string[] // TODO - allow features to specify an optional icon
    // TODO - disable/enable auto generated filters
}

export enum CatalogCardItemType {
    Description = 'description',
    List = 'list',
}

export interface ICatalogCardDescription {
    type: CatalogCardItemType.Description
    title?: string
    description: string
}

export interface ICatalogCardList {
    type: CatalogCardItemType.List
    title: string
    items: ICatalogCardListItem[]
    horizontal?: boolean
    icon?: ReactNode
}

export enum CatalogCardListItemIcon {
    Checkmark = 'checkmark',
    Plus = 'plus',
    CheckCircle = 'check-circle',
    ExclamationCircle = 'exclamation-circle',
}

export interface ICatalogCardListItem {
    icon?: ReactNode
    text: string
    helpTitle?: string
    help?: ReactNode
}

export type CatalogCardItem = ICatalogCardDescription | ICatalogCardList

export function CatalogCard<T extends object>(props: {
    item: T
    itemToCardFn: (item: T) => ICatalogCard
    isSelected: (item: T) => boolean
    selectItem: (item: T) => void
    unselectItem: (item: T) => void
    itemActions?: IItemAction<T>[]
    showSelect: boolean
}) {
    const { item, itemToCardFn, isSelected, selectItem, unselectItem, itemActions, showSelect } = props

    const card = useMemo(() => itemToCardFn(item), [item, itemToCardFn])

    const [isOpen, setIsOpen] = useState(false)
    const onSelect = useCallback(() => {}, [])
    const onClick = useCallback(() => {
        if (isSelected(item)) {
            unselectItem(item)
        } else {
            selectItem(item)
        }
    }, [isSelected, item, selectItem, unselectItem])

    const showDropdown = itemActions !== undefined && itemActions.length > 0
    const showActions = showSelect || showDropdown

    const dropdownItems = useMemo(
        () =>
            itemActions?.map((itemAction, index) => {
                if (isItemActionClick(itemAction)) {
                    return (
                        <DropdownItem
                            key={itemAction.label}
                            onClick={() => {
                                itemAction.onClick(item)
                                setIsOpen(false)
                            }}
                        >
                            {itemAction.label}
                        </DropdownItem>
                    )
                }
                return <DropdownSeparator key={index} />
            }),
        [item, itemActions]
    )

    const disabled = !card.onClick

    return (
        <Card
            id={card.id}
            key={card.id ?? card.title}
            onClick={card.onClick}
            isFlat
            isLarge
            isSelectable={!disabled}
            isRounded
            style={{
                transition: 'box-shadow 0.25s',
                cursor: !disabled ? 'pointer' : undefined,
            }}
        >
            <CardHeader style={{ opacity: !disabled ? undefined : '0.5' }}>
                <Split hasGutter style={{ width: '100%' }}>
                    <SplitItem isFilled>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {card.icon && (
                                <div
                                    style={{
                                        display: 'flex',
                                        height: 40,
                                        width: 40,
                                        marginTop: -20,
                                        marginBottom: -20,
                                        marginRight: 12,
                                        alignItems: 'center',
                                        justifyItems: 'stretch',
                                    }}
                                >
                                    <IconWrapper size="lg">{card.icon}</IconWrapper>
                                </div>
                            )}
                            <CardTitle>{card.title}</CardTitle>
                        </div>
                    </SplitItem>
                    {card.badge && card.badgeTooltip && (
                        <SplitItem>
                            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
                            <div onClick={(e) => e.stopPropagation()}>
                                <Popover headerContent={card.badgeTooltipTitle} bodyContent={card.badgeTooltip}>
                                    <Label color={card.badgeColor}>{card.badge}</Label>
                                </Popover>
                            </div>
                        </SplitItem>
                    )}
                    {card.badge && !card.badgeTooltip && (
                        <SplitItem>
                            <Label color={card.badgeColor}>{card.badge}</Label>
                        </SplitItem>
                    )}
                </Split>
                {showActions && (
                    <CardActions hasNoOffset>
                        {showDropdown && (
                            <Dropdown
                                onSelect={onSelect}
                                toggle={<KebabToggle onToggle={setIsOpen} />}
                                isOpen={isOpen}
                                isPlain
                                dropdownItems={dropdownItems}
                                position="right"
                            />
                        )}
                        {showSelect && (
                            <Checkbox
                                isChecked={isSelected(item)}
                                onChange={onClick}
                                aria-label="card checkbox example"
                                id="check-1"
                                name="check1"
                            />
                        )}
                    </CardActions>
                )}
            </CardHeader>
            {card.items && (
                <Scrollable>
                    <CardBody style={{ paddingTop: 0, opacity: !disabled ? undefined : '0.5' }}>
                        <DescriptionList>
                            {card.items &&
                                card.items.map((item, index) => {
                                    switch (item.type) {
                                        case CatalogCardItemType.Description:
                                            return (
                                                <DescriptionList key={index}>
                                                    <DescriptionListGroup>
                                                        <span style={{ opacity: 9 }}>{item.description}</span>
                                                    </DescriptionListGroup>
                                                </DescriptionList>
                                            )
                                        case CatalogCardItemType.List:
                                            return (
                                                <DescriptionList
                                                    key={index}
                                                    orientation={item.horizontal ? { sm: 'horizontal' } : undefined}
                                                >
                                                    <DescriptionListGroup>
                                                        <DescriptionListTerm>{item.title}</DescriptionListTerm>
                                                        <DescriptionListDescription>
                                                            <CardList icon={item.icon} items={item.items} />
                                                        </DescriptionListDescription>
                                                    </DescriptionListGroup>
                                                </DescriptionList>
                                            )
                                        default:
                                            return <Fragment key={index} />
                                    }
                                })}
                        </DescriptionList>
                    </CardBody>
                </Scrollable>
            )}
            {(card.labels || card.learnMore) && (
                <CardFooter>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'end', gap: 16 }}>
                        <div style={{ flexGrow: 1, opacity: !disabled ? undefined : '0.5' }}>
                            {card.labels && (
                                <LabelGroup>
                                    {card.labels.map((item) => (
                                        <Label key={item.label} color={item.color}>
                                            <Truncate content={item.label} style={{ minWidth: 0 }} />
                                        </Label>
                                    ))}
                                </LabelGroup>
                            )}
                        </div>
                        {card.learnMore && (
                            <Button
                                variant="link"
                                icon={<ExternalLinkAltIcon />}
                                isInline
                                onClick={() => window.open(card.learnMore, '_blank')}
                            >
                                &nbsp;Learn more
                            </Button>
                        )}
                    </div>
                </CardFooter>
            )}
            {card.alertTitle && (
                <Alert title={card.alertTitle} isInline variant={card.alertVariant}>
                    {card.alertContent}
                </Alert>
            )}
        </Card>
    )
}

export function CardSection(props: { title?: string; children: ReactNode }) {
    return (
        <Stack>
            {props.title && (
                <StackItem>
                    <Title headingLevel="h6" style={{ paddingBottom: 8 }}>
                        {props.title}
                    </Title>
                </StackItem>
            )}
            {props.children}
        </Stack>
    )
}

export function CardList(props: { icon?: ReactNode; items: ICatalogCardListItem[] }) {
    const { items, icon } = props
    return (
        <List isPlain>
            {items?.map((listItem, index) => {
                let itemIcon: ReactNode
                if (listItem.icon) {
                    itemIcon = (
                        <IconWrapper size="md" noPadding>
                            {listItem.icon}
                        </IconWrapper>
                    )
                } else if (icon) {
                    itemIcon = (
                        <IconWrapper size="md" noPadding>
                            {icon}
                        </IconWrapper>
                    )
                }
                return (
                    <ListItem key={index} icon={itemIcon} style={{ opacity: 0.85 }}>
                        {listItem.text}
                        {listItem.help && (
                            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                            <div onClick={(e) => e.stopPropagation()}>
                                <Popover headerContent={listItem.helpTitle} bodyContent={listItem.help}>
                                    <Button
                                        variant="link"
                                        style={{
                                            padding: 0,
                                            marginLeft: '8px',
                                            verticalAlign: 'middle',
                                        }}
                                    >
                                        <OutlinedQuestionCircleIcon />
                                    </Button>
                                </Popover>
                            </div>
                        )}
                    </ListItem>
                )
            })}
        </List>
    )
}
