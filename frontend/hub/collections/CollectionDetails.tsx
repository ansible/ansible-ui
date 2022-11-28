import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  CodeBlock,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelBody,
  DrawerPanelContent,
  DropdownPosition,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSection,
  SearchInput,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core'
import { BarsIcon } from '@patternfly/react-icons'
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import { Dispatch, SetStateAction, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  CopyCell,
  Detail,
  DetailsList,
  getPatternflyColor,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  PFColorE,
  TypedActions,
  useBreakpoint,
} from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'
import { TableDetails } from '../../../framework/PageTableDetails'
import { StatusCell } from '../../common/StatusCell'
import { useGet } from '../../common/useItem'
import { RouteE } from '../../Routes'
import { HubItemsResponse } from '../useHubView'
import { Collection } from './Collection'
import { useCollectionActions } from './hooks/useCollectionActions'
import { useCollectionColumns } from './hooks/useCollectionColumns'

export function CollectionDetails() {
  const { t } = useTranslation()
  const params = useParams<{ id: string }>()
  const { data, mutate: refresh } = useGet<HubItemsResponse<Collection>>(
    `/api/automation-hub/_ui/v1/repo/published/?limit=1&name=${params.id ?? ''}`
  )
  let collection: Collection | undefined = undefined
  if (data && data.data && data.data.length > 0) {
    collection = data.data[0]
  }
  const itemActions = useCollectionActions(() => void refresh())
  return (
    <PageLayout>
      <PageHeader
        title={collection?.name}
        breadcrumbs={[
          { label: t('Collections'), to: RouteE.Collections },
          { label: collection?.name },
        ]}
        headerActions={
          <TypedActions<Collection>
            actions={itemActions}
            position={DropdownPosition.right}
            selectedItem={collection}
          />
        }
      />
      <PageTabs>
        <PageTab title={t('Details')}>
          <CollectionDetailsTab collection={collection} />
        </PageTab>
        <PageTab title={t('Install')}>
          <CollectionInstallTab collection={collection} />
        </PageTab>
        <PageTab title={t('Documentation')}>
          <CollectionDocumentationTab collection={collection} />
        </PageTab>
        <PageTab title={t('Contents')}>
          <CollectionContentsTab collection={collection} />
        </PageTab>
        <PageTab title={t('Import log')}>
          <CollectionImportLogTab collection={collection} />
        </PageTab>
        <PageTab title={t('Dependencies')}>
          <CollectionDependenciesTab collection={collection} />
        </PageTab>
      </PageTabs>
    </PageLayout>
  )
}

function CollectionDetailsTab(props: { collection?: Collection }) {
  const { collection } = props
  const tableColumns = useCollectionColumns()
  return (
    <Scrollable>
      <PageSection variant="light">
        <TableDetails item={collection} columns={tableColumns} />
      </PageSection>
    </Scrollable>
  )
}

function CollectionInstallTab(props: { collection?: Collection }) {
  const { t } = useTranslation()
  const { collection } = props
  return (
    <Scrollable>
      <PageSection variant="light">
        <DetailsList>
          <Detail label={t('License')}>
            {collection?.latest_version?.metadata?.license &&
              collection.latest_version.metadata.license?.length > 0 &&
              collection.latest_version.metadata.license[0]}
          </Detail>
          <Detail label={t('Installation')}>
            <CopyCell
              text={`ansible-galaxy collection install ${collection?.namespace?.name ?? ''}.${
                collection?.name ?? ''
              }`}
            />
          </Detail>
          <Detail label={t('Requires')}>
            {collection?.latest_version.requires_ansible &&
              `${t('Ansible')} ${collection.latest_version.requires_ansible}`}
          </Detail>
        </DetailsList>
      </PageSection>
    </Scrollable>
  )
}

function CollectionDocumentationTab(props: { collection?: Collection }) {
  const { collection } = props

  const [content, setContent] = useState<IContents>()

  const { data } = useGet<CollectionDocs>(
    `/api/automation-hub/_ui/v1/repo/published/${collection?.namespace.name ?? ''}/${
      collection?.name ?? ''
    }/?include_related=my_permissions`
  )

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {}
    if (data?.latest_version.docs_blob.contents) {
      for (const content of data.latest_version.docs_blob.contents) {
        let group = groups[content.content_type]
        if (!group) {
          group = { name: content.content_type, contents: [] }
          groups[content.content_type] = group
        }
        group.contents.push(content)
      }
    }
    for (const group of Object.values(groups)) {
      group.contents = group.contents.sort((l, r) => l.content_name.localeCompare(r.content_name))
    }
    return Object.values(groups)
  }, [data?.latest_version.docs_blob.contents])

  const [isDrawerOpen, setDrawerOpen] = useState(true)
  const lg = useBreakpoint('lg')

  return (
    <Drawer isExpanded={isDrawerOpen} isInline={lg} position="left">
      <DrawerContent
        panelContent={
          isDrawerOpen ? (
            <CollectionDocumentationTabPanel
              setDrawerOpen={setDrawerOpen}
              groups={groups}
              content={content}
              setContent={setContent}
            />
          ) : undefined
        }
      >
        <DrawerContentBody>
          <CollectionDocumentationTabContent
            content={content}
            isDrawerOpen={isDrawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  )
}

function CollectionDocumentationTabPanel(props: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>
  content: IContents | undefined
  setContent: Dispatch<SetStateAction<IContents | undefined>>
  groups: {
    name: string
    contents: IContents[]
  }[]
}) {
  const { content, setContent, groups, setDrawerOpen } = props
  const { t } = useTranslation()
  return (
    <DrawerPanelContent>
      <DrawerHead style={{ gap: 16 }}>
        <SearchInput placeholder={t('Find content')} />
        <DrawerActions style={{ alignSelf: 'center' }}>
          <DrawerCloseButton onClick={() => setDrawerOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ borderTop: 'thin solid var(--pf-global--BorderColor--100)' }}>
        <Nav theme="light">
          <NavList>
            <NavExpandable key="documentation" title="Documentation" isExpanded>
              <NavItem key="readme">{t('Readme')}</NavItem>
            </NavExpandable>
            {groups.map((group) => (
              <NavExpandable
                key={group.name}
                title={group.name}
                isExpanded
                isActive={group.contents.find((c) => c === content) !== undefined}
              >
                {group.contents.map((c) => (
                  <NavItem
                    key={c.content_name}
                    onClick={() => setContent(c)}
                    isActive={c === content}
                  >
                    {c.content_name}
                  </NavItem>
                ))}
              </NavExpandable>
            ))}
          </NavList>
        </Nav>
      </DrawerPanelBody>
    </DrawerPanelContent>
  )
}

function CollectionDocumentationTabContent(props: {
  content: IContents | undefined
  isDrawerOpen: boolean
  setDrawerOpen: Dispatch<SetStateAction<boolean>>
}) {
  const { t } = useTranslation()
  const { content, isDrawerOpen, setDrawerOpen } = props
  return (
    <>
      <PageSection variant="light" sticky="top">
        <Stack hasGutter>
          <Breadcrumb>
            {!isDrawerOpen && (
              <BreadcrumbItem>
                <Button onClick={() => setDrawerOpen(true)} variant="plain" isInline>
                  <BarsIcon />
                </Button>
              </BreadcrumbItem>
            )}
            {content?.content_type && <BreadcrumbItem>{content.content_type}</BreadcrumbItem>}
            {content?.content_name && <BreadcrumbItem>{content.content_name}</BreadcrumbItem>}
          </Breadcrumb>
          <Title headingLevel="h1">{content?.content_name}</Title>
          {content?.doc_strings?.doc.short_description && (
            <StackItem>{content?.doc_strings?.doc.short_description}</StackItem>
          )}
        </Stack>
      </PageSection>
      {content?.doc_strings?.doc.description && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Synopsis')}</Title>
            <p>{content?.doc_strings?.doc.description}</p>
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.doc.options && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2">{t('Parameters')}</Title>
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <TableComposable variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Parameter')}</Th>
                  <Th>{t('Choices')}</Th>
                  <Th>{t('Comments')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {content?.doc_strings?.doc.options?.map((option) => (
                  <Tr key={option.name}>
                    <Td>
                      <div>{option.name}</div>
                      <small style={{ opacity: 0.7 }}>{option.type}</small>
                    </Td>
                    <Td>
                      {option.choices?.map((choice) => (
                        <p key={choice}>{choice}</p>
                      ))}
                    </Td>
                    <Td>{option.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </PageSection>
        </>
      )}
      {content?.doc_strings?.doc.notes && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Notes')}</Title>
            {content?.doc_strings?.doc.notes?.map((note, index) => (
              <p key={index}>{note}</p>
            ))}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.examples && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Examples')}</Title>
            {content.doc_strings.examples
              .split('- name')
              .filter((example) => !!example.trim())
              .map((example, index) => (
                <CodeBlock key={index} style={{ overflowY: 'auto' }}>
                  <pre>
                    {'- name'}
                    {example
                      .split('\n')
                      .filter((example) => !!example.trim())
                      .join('\n')}
                  </pre>
                </CodeBlock>
              ))}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.return && (
        <>
          <PageSection variant="light" style={{ paddingBottom: 0 }}>
            <Title headingLevel="h2">{t('Returns')}</Title>
          </PageSection>
          <PageSection variant="light" style={{ paddingLeft: 0, paddingRight: 0, paddingTop: 0 }}>
            <TableComposable variant="compact">
              <Thead>
                <Tr>
                  <Th>{t('Key')}</Th>
                  <Th>{t('Returned')}</Th>
                  <Th>{t('Description')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {content?.doc_strings?.return?.map((parameter) => (
                  <Tr key={parameter.name}>
                    <Td>
                      <div>{parameter.name}</div>
                      <small style={{ opacity: 0.7 }}>{parameter.type}</small>
                    </Td>
                    <Td>{parameter.returned}</Td>
                    <Td>{parameter.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </TableComposable>
          </PageSection>
        </>
      )}
    </>
  )
}

function CollectionContentsTab(_props: { collection?: Collection }) {
  return (
    <Scrollable>
      <PageSection variant="light">TODO</PageSection>
    </Scrollable>
  )
}

function CollectionImportLogTab(props: { collection?: Collection }) {
  const { collection } = props
  const { t } = useTranslation()
  const { data: collectionImportsResponse } = useGet<HubItemsResponse<CollectionImport>>(
    collection
      ? `/api/automation-hub/_ui/v1/imports/collections/?namespace=${collection.namespace.name}&name=${collection.name}&version=${collection.latest_version.version}&sort=-created&limit=1`
      : ''
  )

  const { data: collectionImport } = useGet<CollectionImport>(
    collectionImportsResponse && collectionImportsResponse.data.length
      ? `/api/automation-hub/_ui/v1/imports/collections/${collectionImportsResponse.data[0].id}/`
      : ''
  )
  // http://ec2-54-147-146-116.compute-1.amazonaws.com:8002/api/automation-hub/_ui/v1/imports/collections/ef7849bd-17f5-434f-b35a-3c1877884d12/

  if (!collection) return <></>
  // &sort=-created&offset=0&limit=10

  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <DetailsList>
            <Detail label={t('Status')}>
              <StatusCell status={collectionImport?.state} />
            </Detail>
            <Detail label={t('Approval Status')}>
              {/* <StatusCell status={collectionImport?.} /> */}
            </Detail>
            <Detail label={t('Version')}>
              <StatusCell status={collectionImport?.version} />
            </Detail>
          </DetailsList>
          <Alert
            variant="danger"
            title={
              <Stack>
                {collectionImport?.error?.description.split('\n').map((line, index) => (
                  <StackItem key={index}>{line}</StackItem>
                ))}
              </Stack>
            }
            isInline
            isExpandable
          >
            <pre>{collectionImport?.error?.traceback}</pre>
          </Alert>
          <CodeBlock>
            {collectionImport?.messages?.map((message, index) => (
              <div
                key={index}
                style={{
                  color: getPatternflyColor(
                    message.level === 'INFO'
                      ? PFColorE.Default
                      : message.level === 'WARNING'
                      ? PFColorE.Warning
                      : message.level === 'ERROR'
                      ? PFColorE.Danger
                      : PFColorE.Disabled
                  ),
                }}
              >
                {message.message}
              </div>
            ))}
          </CodeBlock>
        </Stack>
      </PageSection>
    </Scrollable>
  )
}

interface CollectionImport {
  created_at: string
  finished_at: string
  id: string
  name: string
  namespace: string
  started_at: string
  state: string
  updated_at: string
  version: string
  error?: { traceback: string; description: string }
  messages?: { time: number; level: 'INFO' | 'WARNING' | 'ERROR'; message: string }[]
}

function CollectionDependenciesTab(props: { collection?: Collection }) {
  const { collection } = props
  const { t } = useTranslation()
  if (!collection) return <></>
  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Dependencies')}</Title>
          <DescriptionList isHorizontal>
            {Object.keys(collection.latest_version.metadata.dependencies).map((key) => {
              return (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {collection.latest_version.metadata.dependencies[key]}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              )
            })}
          </DescriptionList>
        </Stack>
      </PageSection>
    </Scrollable>
  )
}

export interface CollectionDocs {
  id: string
  namespace: {
    pulp_href: string
    id: number
    name: string
    company: string
    email: string
    avatar_url: string
    description: string
    groups: unknown[]
    related_fields: {
      my_permissions: string[]
    }
  }
  name: string
  download_count: number
  latest_version: {
    id: string
    namespace: string
    name: string
    version: string
    requires_ansible: string
    created_at: string
    metadata: {
      dependencies: {
        'ansible.utils': string
      }
      contents: {
        name: string
        description: null | string
        content_type: string
      }[]
      documentation: string
      homepage: string
      issues: string
      repository: string
      description: string
      authors: string[]
      license: unknown[]
      tags: string[]
      signatures: unknown[]
    }
    contents: {
      name: string
      content_type: string
      description: null | string
    }[]
    sign_state: string
    docs_blob: {
      contents: IContents[]
      collection_readme: {
        html: string
        name: string
      }
      documentation_files: unknown[]
    }
  }
  all_versions: {
    id: string
    version: string
    created: string
    sign_state: string
  }[]
  sign_state: string
}

interface IContents {
  doc_strings: null | {
    doc: {
      notes?: string[]
      author: string | string[]
      module?: string
      options?: {
        name: string
        type?: string
        description: string | string[]
        choices?: string[]
        default?: (boolean | number | string) | string[]
        required?: boolean
        aliases?: string[]
        elements?: string
        suboptions?: {
          name: string
          type: string
          description: string[]
        }[]
        env?: {
          name: string
        }[]
        ini?: {
          key: string
          section: string
        }[]
        vars?: {
          name: string
        }[]
        version_added?: string
        version_added_collection?: string
        cli?: {
          name: string
        }[]
      }[]
      filename: string
      collection: string
      has_action?: boolean
      description: string[]
      version_added: string
      short_description: string
      version_added_collection: string
      requirements?: string[]
      name?: string
    }
    return:
      | null
      | {
          name: string
          type: string
          sample?:
            | (number | string)
            | string[]
            | {
                avg?: number
                max?: number
                min?: number
                after?: string
                before?: string
              }
          returned: string
          description: string
          contains?: {
            name: string
            type: string
            description: string[]
          }[]
        }[]
    examples: null | string
    metadata: null
  }
  readme_file: null
  readme_html: null
  content_name: string
  content_type: string
}
