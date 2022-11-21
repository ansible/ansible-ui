import { ButtonVariant, Label } from '@patternfly/react-core'
import {
  BanIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  UploadIcon,
} from '@patternfly/react-icons'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ITableColumn,
  IToolbarFilter,
  ITypedAction,
  LabelsCell,
  PageHeader,
  PageLayout,
  PageTable,
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
        type: TypedActionType.single,
        icon: UploadIcon,
        variant: ButtonVariant.secondary,
        label: 'Upload new version',
        onClick: () => {
          /**/
        },
      },
      { type: TypedActionType.seperator },
      {
        type: TypedActionType.button,
        icon: TrashIcon,
        label: 'Delete entire collection',
        onClick: () => {
          /**/
        },
      },
      {
        type: TypedActionType.button,
        icon: BanIcon,
        label: 'Deprecate',
        onClick: () => {
          /**/
        },
      },
    ],
    []
  )
  // const dataCells = useMemo(
  //   () => [
  //     (item: Collection) => (
  //       <Stack hasGutter>
  //         <Stack>
  //           <StackItem>
  //             <Button variant="link" isInline>
  //               {item.name}
  //             </Button>
  //           </StackItem>
  //           <StackItem>
  //             <Text component="small" style={{ opacity: 0.7 }}>
  //               {t('Provided by')} {item.namespace.name}
  //             </Text>
  //           </StackItem>
  //         </Stack>
  //         <StackItem>{item.latest_version.metadata.description}</StackItem>
  //         <StackItem>
  //           <LabelGroup numLabels={999}>
  //             {item.latest_version.metadata.tags.map((tag) => (
  //               <Label key={tag}>{tag}</Label>
  //             ))}
  //           </LabelGroup>
  //         </StackItem>
  //       </Stack>
  //     ),
  //     (item: Collection) => (
  //       <Stack hasGutter>
  //         <StackItem style={{ whiteSpace: 'nowrap' }}>
  //           {t('Updated')} <SinceCell value={item.latest_version.created_at} />
  //         </StackItem>
  //         <StackItem>
  //           {t('v')}
  //           {item.latest_version.version}
  //         </StackItem>
  //         <StackItem>
  //           <Label variant="outline" color="orange" icon={<ExclamationTriangleIcon />}>
  //             {item.sign_state === 'signed' ? 'Signed' : 'Unsigned'}
  //           </Label>
  //         </StackItem>
  //       </Stack>
  //     ),
  //   ],
  //   [t]
  // )
  const tableColumns = useCollectionsColumns()
  const view = useHubView<Collection>(
    '/api/automation-hub/_ui/v1/repo/published/',
    idKeyFn,
    toolbarFilters
  )
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
      {/* <PageTabs>
        <PageTab title="Data List">
          <PageBody disablePadding>
            <PageDataList<Collection>
              toolbarFilters={toolbarFilters}
              dataCells={dataCells}
              actions={actions}
              errorStateTitle={t('Error loading collections')}
              emptyStateTitle={t('No collections yet')}
              {...view}
            />
          </PageBody>
        </PageTab>
        <PageTab title="Table"> */}
      <PageTable<Collection>
        toolbarFilters={toolbarFilters}
        tableColumns={tableColumns}
        rowActions={actions}
        errorStateTitle={t('Error loading collections')}
        emptyStateTitle={t('No collections yet')}
        {...view}
        defaultTableView="list"
      />
      {/* </PageTab>
      </PageTabs> */}
    </PageLayout>
  )
}

export function useCollectionsColumns(_options?: {
  disableSort?: boolean
  disableLinks?: boolean
}) {
  const { t } = useTranslation()
  const tableColumns = useMemo<ITableColumn<Collection>[]>(
    () => [
      {
        header: t('Name'),
        cell: (collection) => <TextCell text={collection.name} onClick={() => null} />,
      },
      {
        header: t('Namespace'),
        cell: (collection) => <TextCell text={collection.namespace.name} onClick={() => null} />,
        card: 'description',
      },
      {
        header: t('Description'),
        cell: (collection) => <TextCell text={collection.latest_version.metadata.description} />,
        hideLabel: true,
      },
      {
        header: t('Modules'),
        cell: (collection) => (
          <TextCell
            text={collection.latest_version.metadata.contents
              .filter((c) => c.content_type === 'module')
              .length.toString()}
          />
        ),
        card: 'count',
      },
      {
        header: t('Roles'),
        cell: (collection) => (
          <TextCell
            text={collection.latest_version.metadata.contents
              .filter((c) => c.content_type === 'TODO')
              .length.toString()}
          />
        ),
        card: 'count',
      },
      {
        header: t('Plugins'),
        cell: (collection) => (
          <TextCell
            text={collection.latest_version.metadata.contents
              .filter((c) => c.content_type === 'TODO')
              .length.toString()}
          />
        ),
        card: 'count',
      },
      {
        header: t('Dependencies'),
        cell: (collection) => (
          <TextCell
            text={Object.keys(collection.latest_version.metadata.dependencies).length.toString()}
          />
        ),
        card: 'count',
      },
      {
        header: t('Updated'),
        cell: (collection) => <SinceCell value={collection.latest_version.created_at} />,
        list: 'secondary',
      },
      {
        header: t('Version'),
        cell: (collection) => <TextCell text={`v${collection.latest_version.version}`} />,
        list: 'secondary',
        card: 'hidden',
      },
      {
        header: t('Signed state'),
        cell: (collection) => {
          switch (collection.latest_version.sign_state) {
            case 'signed':
              return (
                <Label icon={<CheckCircleIcon />} variant="outline" color="green">
                  {t('Signed')}
                </Label>
              )
            case 'unsigned':
              return (
                <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
                  {t('Unsigned')}
                </Label>
              )
            default:
              return <></>
          }
        },
        list: 'secondary',
      },
      {
        header: t('Tags'),
        cell: (collection) => (
          <LabelsCell labels={collection.latest_version.metadata.tags.sort()} />
        ),
        hideLabel: true,
      },
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
