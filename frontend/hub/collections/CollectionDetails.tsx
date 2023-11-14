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
  Label,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  PageSection,
  SearchInput,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { LoadingPage } from '../../../framework';
import React from 'react';
import { DropdownPosition } from '@patternfly/react-core/deprecated';
import {
  BarsIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DownloadIcon,
} from '@patternfly/react-icons';
import { Table /* data-codemods */, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { DateTime } from 'luxon';
import { Dispatch, SetStateAction, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  CopyCell,
  PFColorE,
  PageActions,
  PageDetails,
  PageDetailsFromColumns,
  PageHeader,
  PageLayout,
  PageTab,
  PageTabs,
  getPatternflyColor,
  useBreakpoint,
  useGetPageUrl,
} from '../../../framework';
import { PageDetail } from '../../../framework/PageDetails/PageDetail';
import { Scrollable } from '../../../framework/components/Scrollable';
import { AwxError } from '../../awx/common/AwxError';
import { StatusCell } from '../../common/Status';
import { useGetRequest, useGet } from '../../common/crud/useGet';
import { HubRoute } from '../HubRoutes';
import { hubAPI, pulpAPI } from '../api/formatPath';
import { HubItemsResponse } from '../useHubView';
import { PageSingleSelect } from './../../../framework/PageInputs/PageSingleSelect';
import { CollectionVersionSearch } from './Collection';
import { useCollectionActions } from './hooks/useCollectionActions';
import { useCollectionColumns } from './hooks/useCollectionColumns';
import { usePageNavigate } from '../../../framework';
import { useRepositoryBasePath } from '../api/utils';
import { requestGet } from '../../common/crud/Data';
import { CollectionVersionListResponse } from '../api-schemas/generated/CollectionVersionListResponse';

export function CollectionDetails() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemActions = useCollectionActions(() => void refresh(), true);
  const [collection, setCollection] = useState<CollectionVersionSearch | undefined>(undefined);
  const [collections, setCollections] = useState<CollectionVersionSearch[]>([]);
  const [collectionError, setCollectionError] = useState<JSX.Element | undefined>(undefined);
  const request = useGetRequest<HubItemsResponse<CollectionVersionSearch>>();

  const navigate = usePageNavigate();

  function setVersionParams(version: string) {
    setSearchParams((params) => {
      params.set('version', version);
      return params;
    });
  }

  const name = searchParams.get('name') || '';
  const namespace = searchParams.get('namespace') || '';
  const repository = searchParams.get('repository') || '';
  const redirectIfEmpty = searchParams.get('redirectIfEmpty') || '';

  useEffect(() => {
    if (!(name && namespace && repository)) {
      setCollectionError(<AwxError error={{ name: 'not found', message: t('Not Found') }} />);
    }
  }, [name, namespace, repository, setCollectionError, t]);

  useEffect(() => {
    void (async function () {
      try {
        const res = await request(hubAPI`/v3/plugin/ansible/search/collection-versions/`, {
          name,
          namespace,
          repository_name: repository,
        });

        if (res.data.length == 0) {
          if (redirectIfEmpty) {
            navigate(HubRoute.Collections);
          } else {
            setCollectionError(<AwxError error={{ name: 'not found', message: t('Not Found') }} />);
          }
        }

        if (redirectIfEmpty) {
          const newParams = new URLSearchParams(searchParams.toString());

          // Set a new query parameter or update existing ones
          newParams.set('redirectIfEmpty', '');

          setSearchParams(newParams);
        }

        setCollections(res.data);
      } catch (error) {
        setCollectionError(<AwxError error={{ name: 'not found', message: t('Not Found') }} />);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, namespace, repository, redirectIfEmpty, t]);

  // load collection by search params
  const version = searchParams.get('version');

  let highestFilter = '';
  let versionFilter = '';

  if (!version) {
    // for unspecified version, load highest
    highestFilter = '&isHighest=true';
  } else {
    versionFilter = '&version=' + version;
  }

  const { data, refresh, error, isLoading } = useGet<HubItemsResponse<CollectionVersionSearch>>(
    hubAPI`/v3/plugin/ansible/search/collection-versions/?name=${
      searchParams.get('name') || ''
    }&namespace=${searchParams.get('namespace') || ''}&repository_name=${
      searchParams.get('repository') || ''
    }&order_by=-version` +
      versionFilter +
      highestFilter
  );

  if (data && data.data.length > 0) {
    const newCollection = data.data[0];
    if (
      !collection ||
      collection.collection_version?.version != newCollection.collection_version?.version
    ) {
      setCollection(newCollection);
    }
  }

  const getPageUrl = useGetPageUrl();

  if (error || (isLoading == false && data && data.data.length == 0)) {
    return (
      <AwxError
        error={error || { name: 'not found', message: t('Not Found') }}
        handleRefresh={refresh}
      />
    );
  }

  if (collectionError) {
    return collectionError;
  }

  return (
    <PageLayout>
      <PageHeader
        title={collection?.collection_version?.name}
        breadcrumbs={[
          { label: t('Collections'), to: getPageUrl(HubRoute.Collections) },
          { label: collection?.collection_version?.name },
        ]}
        headerActions={
          collection && (
            <PageActions<CollectionVersionSearch>
              actions={itemActions}
              position={DropdownPosition.right}
              selectedItem={collection}
            />
          )
        }
        description={t('Repository: ') + collection?.repository?.name}
        footer={
          <div style={{ display: 'flex', alignItems: 'center', gridGap: '8px' }}>
            {t('Version')}
            <PageSingleSelect<string>
              options={
                collections
                  ? collections.map((item) => {
                      let label =
                        item.collection_version?.version +
                        ' ' +
                        t('updated') +
                        ' ' +
                        `${DateTime.fromISO(
                          item.collection_version?.pulp_created || ''
                        ).toRelative()} (${item.is_signed ? t('signed') : t('unsigned')})`;
                      if (item.is_highest) {
                        label += ' (' + t('latest') + ')';
                      }
                      return {
                        value: item.collection_version?.version || '',
                        label,
                      };
                    })
                  : []
              }
              onSelect={(item: string) => {
                const found = collections.find(
                  (item2) => item2.collection_version?.version == item
                );
                if (found && found.collection_version) {
                  setVersionParams(found.collection_version?.version);
                }
              }}
              placeholder={''}
              value={collection?.collection_version?.version || ''}
            />
            {collection?.collection_version &&
              t('Last updated') +
                ' ' +
                DateTime.fromISO(collection.collection_version?.pulp_created).toRelative()}
            {collection &&
              (collection.is_signed ? (
                <Label icon={<CheckCircleIcon />} variant="outline" color="green">
                  {' ' + t('Signed')}
                </Label>
              ) : (
                <Label icon={<ExclamationTriangleIcon />} variant="outline" color="orange">
                  {' ' + t('Unsigned')}
                </Label>
              ))}
          </div>
        }
      />

      {collection && (
        <PageTabs>
          <PageTab label={t('Details')}>
            <CollectionDetailsTab collection={collection} />
          </PageTab>
          <PageTab label={t('Install')}>
            <CollectionInstallTab collection={collection} />
          </PageTab>
          <PageTab label={t('Documentation')}>
            <CollectionDocumentationTab collection={collection} />
          </PageTab>
          <PageTab label={t('Contents')}>
            <CollectionContentsTab collection={collection} />
          </PageTab>
          <PageTab label={t('Import log')}>
            <CollectionImportLogTab collection={collection} />
          </PageTab>
          <PageTab label={t('Dependencies')}>
            <CollectionDependenciesTab collection={collection} />
          </PageTab>
        </PageTabs>
      )}
    </PageLayout>
  );
}

function CollectionDetailsTab(props: { collection?: CollectionVersionSearch | undefined }) {
  const { collection } = props;
  const tableColumns = useCollectionColumns();
  return <PageDetailsFromColumns item={collection} columns={tableColumns} />;
}

function CollectionInstallTab(props: { collection: CollectionVersionSearch }) {
  const { t } = useTranslation();
  const downloadLinkRef = React.useRef<HTMLAnchorElement>(null);
  const { collection } = props;
  const { basePath, error, loading } = useRepositoryBasePath(
    collection.repository?.name ?? '',
    collection.repository?.pulp_href
  );

  if (loading) {
    <LoadingPage breadcrumbs tabs />;
  }
  if (error) {
    return <AwxError error={new Error(error)} />;
  }

  return (
    <Scrollable>
      <PageSection variant="light">
        <PageDetails>
          <PageDetail label={t('License')}>
            {/*collection?.latest_version?.metadata?.license &&
              collection.latest_version.metadata.license?.length > 0 &&
              collection.latest_version.metadata.license[0]*/}
            {t`License not implemented yet`}
          </PageDetail>
          <PageDetail label={t('Installation')}>
            <CopyCell
              text={`ansible-galaxy collection install ${
                collection?.collection_version?.namespace ?? ''
              }.${collection?.collection_version?.name ?? ''}`}
            />
            <PageDetail>
              {t(`Note Installing collecion with ansible-galaxy is only supported in ansible 2.9+`)}
            </PageDetail>
            <a href="/#" ref={downloadLinkRef} style={{ display: 'none' }}>
              {t(`Link`)}
            </a>
            <Button
              variant="link"
              icon={<DownloadIcon />}
              onClick={() => {
                void Download(basePath, collection, downloadLinkRef);
              }}
            >
              {t(`Download tarball`)}
            </Button>
          </PageDetail>
          <PageDetail label={t('Requires')}>
            {collection?.collection_version?.require_ansible &&
              `${t('Ansible')} ${collection.collection_version?.require_ansible}`}
          </PageDetail>
        </PageDetails>
      </PageSection>
    </Scrollable>
  );
}

async function Download(
  basePath: string,
  collection: CollectionVersionSearch | undefined,
  downloadLinkRef: React.RefObject<HTMLAnchorElement>
) {
  const downloadURL = await requestGet<{ download_url: string }>(
    hubAPI`/v3/plugin/ansible/content/${basePath}/collections/index/${
      collection?.collection_version?.namespace || ''
    }/${collection?.collection_version?.name || ''}/versions/${
      collection?.collection_version?.version || ''
    }/`
  );
  if (downloadLinkRef.current) {
    downloadLinkRef.current.href = downloadURL.download_url;
    downloadLinkRef.current.click();
  }
}

type CollectionVersionsContent = {
  count: number;
  next: string;
  previous: string;
  results: unknown[];
};

function CollectionDocumentationTab(props: { collection?: CollectionVersionSearch }) {
  const { collection } = props;

  const [content, setContent] = useState<IContents>();

  const { data, error, refresh } = useGet<CollectionVersionsContent>(
    pulpAPI`/content/ansible/collection_versions/?namespace=${
      collection?.collection_version?.namespace || ''
    }&name=${collection?.collection_version?.name || ''}&version=${
      collection?.collection_version?.version || ''
    }&offset=0&limit=1`
  );

  if (error || data?.results?.length == 0)
    return <AwxError error={new Error(error)} handleRefresh={refresh} />;
  if (!data) return <LoadingPage breadcrumbs tabs />;

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {};
    if (data) {
      for (const content of data.results[0].docs_blob.contents) {
        let group = groups[content.content_type];
        if (!group) {
          group = { name: content.content_type, contents: [] };
          groups[content.content_type] = group;
        }
        group.contents.push(content);
      }
    }
    for (const group of Object.values(groups)) {
      group.contents = group.contents.sort((l, r) => l.content_name.localeCompare(r.content_name));
    }
    return Object.values(groups);
  }, [data]);

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const lg = useBreakpoint('lg');

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
  );
}

function CollectionDocumentationTabPanel(props: {
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
  content: IContents | undefined;
  setContent: Dispatch<SetStateAction<IContents | undefined>>;
  groups: {
    name: string;
    contents: IContents[];
  }[];
}) {
  const { content, setContent, groups, setDrawerOpen } = props;
  const { t } = useTranslation();

  return (
    <DrawerPanelContent>
      <DrawerHead style={{ gap: 16 }}>
        <SearchInput placeholder={t('Find content')} />
        <DrawerActions style={{ alignSelf: 'center' }}>
          <DrawerCloseButton onClick={() => setDrawerOpen(false)} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody style={{ borderTop: 'thin solid var(--pf-v5-global--BorderColor--100)' }}>
        <Nav theme="light">
          <NavList>
            <NavExpandable key="documentation" title={t('Documentation')} isExpanded>
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
  );
}

const splitString = '- name';

function CollectionDocumentationTabContent(props: {
  content: IContents | undefined;
  isDrawerOpen: boolean;
  setDrawerOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { t } = useTranslation();
  const { content, isDrawerOpen, setDrawerOpen } = props;
  return (
    <>
      <PageSection variant="light">
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
            <Table variant="compact">
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
                    <Td>{option.choices?.map((choice) => <p key={choice}>{choice}</p>)}</Td>
                    <Td>{option.description}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </PageSection>
        </>
      )}
      {content?.doc_strings?.doc.notes && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Notes')}</Title>
            {content?.doc_strings?.doc.notes?.map((note, index) => <p key={index}>{note}</p>)}
          </Stack>
        </PageSection>
      )}
      {content?.doc_strings?.examples && (
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h2">{t('Examples')}</Title>
            {content.doc_strings.examples
              .split(splitString)
              .filter((example) => !!example.trim())
              .map((example, index) => (
                <CodeBlock key={index} style={{ overflowY: 'auto' }}>
                  <pre>
                    {splitString}
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
            <Table variant="compact">
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
            </Table>
          </PageSection>
        </>
      )}
    </>
  );
}

function CollectionContentsTab(_props: { collection?: CollectionVersionSearch }) {
  return (
    <Scrollable>
      <PageSection variant="light">TODO</PageSection>
    </Scrollable>
  );
}

function CollectionImportLogTab(props: { collection?: CollectionVersionSearch }) {
  const { collection } = props;
  const { t } = useTranslation();
  const { data: collectionImportsResponse } = useGet<HubItemsResponse<CollectionImport>>(
    collection
      ? hubAPI`/_ui/v1/imports/collections/?namespace=${
          collection.collection_version?.namespace || ''
        }&name=${collection.collection_version?.name || ''}&version=${
          collection.collection_version?.version || ''
        }&sort=-created&limit=1`
      : ''
  );

  const { data: collectionImport } = useGet<CollectionImport>(
    collectionImportsResponse && collectionImportsResponse.data.length
      ? hubAPI`/_ui/v1/imports/collections/${collectionImportsResponse.data[0].id}/`
      : ''
  );
  // http://ec2-54-147-146-116.compute-1.amazonaws.com:8002/api/automation-hub/_ui/v1/imports/collections/ef7849bd-17f5-434f-b35a-3c1877884d12/

  if (!collection) return <></>;
  // &sort=-created&offset=0&limit=10

  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <PageDetails>
            <PageDetail label={t('Status')}>
              <StatusCell status={collectionImport?.state} />
            </PageDetail>
            {/* <Detail label={t('Approval Status')}>
            </Detail> */}
            <PageDetail label={t('Version')}>{collectionImport?.version}</PageDetail>
          </PageDetails>
          {collectionImport?.error && (
            <Alert
              variant="danger"
              title={
                <Stack>
                  {collectionImport?.error?.description
                    .split('\n')
                    .map((line, index) => <StackItem key={index}>{line}</StackItem>)}
                </Stack>
              }
              isInline
              isExpandable
            >
              <pre>{collectionImport?.error?.traceback}</pre>
            </Alert>
          )}
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
  );
}

interface CollectionImport {
  created_at: string;
  finished_at: string;
  id: string;
  name: string;
  namespace: string;
  started_at: string;
  state: string;
  updated_at: string;
  version: string;
  error?: { traceback: string; description: string };
  messages?: { time: number; level: 'INFO' | 'WARNING' | 'ERROR'; message: string }[];
}

function CollectionDependenciesTab(props: { collection?: CollectionVersionSearch }) {
  const { collection } = props;
  const { t } = useTranslation();
  if (!collection?.collection_version?.dependencies) return <></>;
  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Dependencies')}</Title>
          <DescriptionList isHorizontal>
            {Object.keys(collection.collection_version.dependencies).map((key) => {
              return (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {collection.collection_version?.dependencies
                      ? collection.collection_version.dependencies[key]
                      : ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              );
            })}
          </DescriptionList>
        </Stack>
      </PageSection>
    </Scrollable>
  );
}

export interface CollectionDocs {
  id: string;
  namespace: {
    pulp_href: string;
    id: number;
    name: string;
    company: string;
    email: string;
    avatar_url: string;
    description: string;
    groups: unknown[];
    related_fields: {
      my_permissions: string[];
    };
  };
  name: string;
  download_count: number;
  latest_version: {
    id: string;
    namespace: string;
    name: string;
    version: string;
    requires_ansible: string;
    created_at: string;
    metadata: {
      dependencies: {
        'ansible.utils': string;
      };
      contents: {
        name: string;
        description: null | string;
        content_type: string;
      }[];
      documentation: string;
      homepage: string;
      issues: string;
      repository: string;
      description: string;
      authors: string[];
      license: unknown[];
      tags: string[];
      signatures: unknown[];
    };
    contents: {
      name: string;
      content_type: string;
      description: null | string;
    }[];
    sign_state: string;
    docs_blob: {
      contents: IContents[];
      collection_readme: {
        html: string;
        name: string;
      };
      documentation_files: unknown[];
    };
  };
  all_versions: {
    id: string;
    version: string;
    created: string;
    sign_state: string;
  }[];
  sign_state: string;
}

interface IContents {
  doc_strings: null | {
    doc: {
      notes?: string[];
      author: string | string[];
      module?: string;
      options?: {
        name: string;
        type?: string;
        description: string | string[];
        choices?: string[];
        default?: (boolean | number | string) | string[];
        required?: boolean;
        aliases?: string[];
        elements?: string;
        suboptions?: {
          name: string;
          type: string;
          description: string[];
        }[];
        env?: {
          name: string;
        }[];
        ini?: {
          key: string;
          section: string;
        }[];
        vars?: {
          name: string;
        }[];
        version_added?: string;
        version_added_collection?: string;
        cli?: {
          name: string;
        }[];
      }[];
      filename: string;
      collection: string;
      has_action?: boolean;
      description: string[];
      version_added: string;
      short_description: string;
      version_added_collection: string;
      requirements?: string[];
      name?: string;
    };
    return:
      | null
      | {
          name: string;
          type: string;
          sample?:
            | (number | string)
            | string[]
            | {
                avg?: number;
                max?: number;
                min?: number;
                after?: string;
                before?: string;
              };
          returned: string;
          description: string;
          contains?: {
            name: string;
            type: string;
            description: string[];
          }[];
        }[];
    examples: null | string;
    metadata: null;
  };
  readme_file: null;
  readme_html: null;
  content_name: string;
  content_type: string;
}
