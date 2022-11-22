import {
  Breadcrumb,
  BreadcrumbItem,
  DropdownPosition,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSection,
  SearchInput,
  Split,
  SplitItem,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core'
import { TableComposable, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import {
  CopyCell,
  Detail,
  DetailsList,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  TypedActions,
} from '../../../framework'
import { Scrollable } from '../../../framework/components/Scrollable'
import { TableDetails } from '../../../framework/PageTableDetails'
import { useSettings } from '../../../framework/Settings'
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
  const settings = useSettings()
  const tableColumns = useCollectionColumns()
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
  const { t } = useTranslation()
  const { collection } = props

  const [content, setContent] = useState<IContents>()

  const { data } = useGet<CollectionDocs>(
    `/api/automation-hub/_ui/v1/repo/published/${collection?.namespace.name ?? ''}/${
      collection?.name ?? ''
    }/?include_related=my_permissions`
  )

  const docGroups = useMemo(() => {
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

  return (
    <PageSection variant="light" padding={{ default: 'noPadding' }}>
      <Split>
        <SplitItem style={{ borderRight: 'thin solid var(--pf-global--BorderColor--100)' }}>
          <Scrollable>
            <Stack>
              <PageSection variant="light">
                <SearchInput />
              </PageSection>
              <PageSection variant="light" padding={{ default: 'noPadding' }}>
                <Nav theme="light">
                  <NavList>
                    {docGroups.map((group) => (
                      <NavExpandable key={group.name} title={group.name} isExpanded>
                        {group.contents.map((content) => (
                          <NavItem key={content.content_name} onClick={() => setContent(content)}>
                            {content.content_name}
                          </NavItem>
                        ))}
                      </NavExpandable>
                    ))}
                  </NavList>
                </Nav>
              </PageSection>
            </Stack>
          </Scrollable>
        </SplitItem>
        <SplitItem isFilled>
          <Scrollable>
            <PageSection variant="light">
              <Stack hasGutter>
                <Breadcrumb>
                  <BreadcrumbItem>{content?.content_type}</BreadcrumbItem>
                  <BreadcrumbItem>{content?.content_name}</BreadcrumbItem>
                </Breadcrumb>
                <Title headingLevel="h1">{content?.content_name}</Title>
                <StackItem>{content?.doc_strings?.doc.short_description}</StackItem>
                <Title headingLevel="h2">{t('Synopsis')}</Title>
                <p>{content?.doc_strings?.doc.description}</p>
              </Stack>
            </PageSection>
            <PageSection variant="light" style={{ paddingTop: 0, paddingBottom: 0 }}>
              <Title headingLevel="h2">{t('Parameters')}</Title>
            </PageSection>
            <PageSection variant="light" padding={{ default: 'noPadding' }}>
              <TableComposable variant="compact" isStriped>
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
              <PageSection variant="light">
                <Stack hasGutter>
                  <Title headingLevel="h2">{t('Notes')}</Title>
                  <Stack hasGutter>
                    {content?.doc_strings?.doc.notes?.map((note, index) => (
                      <p key={index}>{note}</p>
                    ))}
                  </Stack>
                </Stack>
              </PageSection>
              {/* <pre>{JSON.stringify(content, undefined, ' ')}</pre> */}
            </PageSection>
          </Scrollable>
        </SplitItem>
      </Split>
    </PageSection>
  )
}

function CollectionContentsTab(props: { collection?: Collection }) {
  const { t } = useTranslation()
  const { collection } = props
  return (
    <Scrollable>
      <PageSection variant="light">TODO</PageSection>
    </Scrollable>
  )
}

function CollectionImportLogTab(props: { collection?: Collection }) {
  const { t } = useTranslation()
  const { collection } = props
  return (
    <Scrollable>
      <PageSection variant="light">TODO</PageSection>
    </Scrollable>
  )
}

function CollectionDependenciesTab(props: { collection?: Collection }) {
  const { t } = useTranslation()
  const { collection } = props
  return (
    <Scrollable>
      <PageSection variant="light">TODO</PageSection>
    </Scrollable>
  )
}

/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

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
