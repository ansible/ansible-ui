import { Button, ButtonVariant, Label, LabelGroup, Stack, StackItem, Text } from '@patternfly/react-core'
import { ExclamationTriangleIcon } from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    ITableColumn,
    IToolbarFilter,
    ITypedAction,
    LabelsCell,
    PageBody,
    PageDataList,
    PageHeader,
    PageLayout,
    SinceCell,
    TextCell,
    TypedActionType,
} from '../../../../framework'
import { idKeyFn, useHubView } from '../../useHubView'
import { Collection } from './Collection'

export function Collections() {
    const { t } = useTranslation()
    const toolbarFilters = useCollectionFilters()
    const actions = useMemo<ITypedAction<Collection>[]>(
        () => [
            {
                type: TypedActionType.button,
                variant: ButtonVariant.secondary,
                label: 'Upload new version',
                onClick: () => {
                    /**/
                },
            },
            { type: TypedActionType.seperator },
            {
                type: TypedActionType.button,
                label: 'Delete entire collection',
                onClick: () => {
                    /**/
                },
            },
            {
                type: TypedActionType.button,
                label: 'Deprecate',
                onClick: () => {
                    /**/
                },
            },
        ],
        []
    )
    const dataCells = useMemo(
        () => [
            (item: Collection) => (
                <Stack hasGutter>
                    <Stack>
                        <StackItem>
                            <Button variant="link" isInline>
                                {item.name}
                            </Button>
                        </StackItem>
                        <StackItem>
                            <Text component="small" style={{ opacity: 0.7 }}>
                                {t('Provided by')} {item.namespace.name}
                            </Text>
                        </StackItem>
                    </Stack>
                    <StackItem>{item.latest_version.metadata.description}</StackItem>
                    <StackItem>
                        <LabelGroup numLabels={999}>
                            {item.latest_version.metadata.tags.map((tag) => (
                                <Label key={tag}>{tag}</Label>
                            ))}
                        </LabelGroup>
                    </StackItem>
                </Stack>
            ),
            (item: Collection) => (
                <Stack hasGutter>
                    <StackItem style={{ whiteSpace: 'nowrap' }}>
                        {t('Updated')} <SinceCell value={item.latest_version.created_at} />
                    </StackItem>
                    <StackItem>
                        {t('v')}
                        {item.latest_version.version}
                    </StackItem>
                    <StackItem>
                        <Label variant="outline" color="orange" icon={<ExclamationTriangleIcon />}>
                            {item.sign_state === 'signed' ? 'Signed' : 'Unsigned'}
                        </Label>
                    </StackItem>
                </Stack>
            ),
        ],
        [t]
    )
    const view = useHubView<Collection>('/api/automation-hub/_ui/v1/repo/published/', idKeyFn, toolbarFilters)
    return (
        <PageLayout>
            <PageHeader
                title={t('Collections')}
                description={t(
                    'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
                )}
                titleHelpTitle={t('Collections')}
                titleHelp={t(
                    'Collections are a distribution format for Ansible content that can include playbooks, roles, modules, and plugins.'
                )}
                titleDocLink="https://docs.ansible.com/ansible/latest/user_guide/collections_using.html"
            />
            <PageBody>
                <PageDataList<Collection>
                    toolbarFilters={toolbarFilters}
                    dataCells={dataCells}
                    actions={actions}
                    errorStateTitle={t('Error loading collections')}
                    emptyStateTitle={t('No collections yet')}
                    {...view}
                />
            </PageBody>
        </PageLayout>
    )
}

export function useCollectionsColumns(_options?: { disableSort?: boolean; disableLinks?: boolean }) {
    const { t } = useTranslation()
    const tableColumns = useMemo<ITableColumn<Collection>[]>(
        () => [
            { header: t('Name'), cell: (collection) => <TextCell text={collection.name} /> },
            { header: t('Description'), cell: (collection) => <TextCell text={collection.latest_version.metadata.description} /> },
            { header: t('Created'), cell: (collection) => <SinceCell value={collection.latest_version.created_at} /> },
            { header: t('Version'), cell: (collection) => <TextCell text={collection.latest_version.version} /> },
            { header: t('Signed state'), cell: (collection) => <TextCell text={collection.latest_version.sign_state} /> },
            { header: t('Tags'), cell: (collection) => <LabelsCell labels={collection.latest_version.metadata.tags.sort()} /> },
        ],
        [t]
    )
    return tableColumns
}

export function useCollectionFilters() {
    const { t } = useTranslation()
    const toolbarFilters = useMemo<IToolbarFilter[]>(
        () => [
            { key: 'keywords', label: t('Keywords'), type: 'string', query: 'keywords' },
            { key: 'namespace', label: t('Namespace'), type: 'string', query: 'namespace' },
            { key: 'tags', label: t('Tags'), type: 'string', query: 'tags' },
            { key: 'sign-state', label: t('Sign state'), type: 'string', query: 'sign_state' },
        ],
        [t]
    )
    return toolbarFilters
}
