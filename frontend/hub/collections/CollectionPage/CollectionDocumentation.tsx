import { Checkbox, Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LoadingPage, useBreakpoint } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { pulpAPI } from '../../common/api/formatPath';
import { CollectionVersionSearch, IContents } from '../Collection';
import { CollectionDocumentationTabContent } from './documentationComponents/CollectionDocumentationTabContent';
import { CollectionDocumentationTabPanel } from './documentationComponents/CollectionDocumentationTabPanel';
import { HubError } from '../../common/HubError';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Title } from '@patternfly/react-core';
import { PageSection } from '@patternfly/react-core';

export function CollectionDocumentation() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();
  const [renderJson, setRenderJson] = useState(false);
  const [searchText, setSearchText] = useState('');
  const params = useParams();

  const { data, error, refresh } = useGet<CollectionVersionsContent>(
    pulpAPI`/content/ansible/collection_versions/?namespace=${
      collection?.collection_version?.namespace || ''
    }&name=${collection?.collection_version?.name || ''}&version=${
      collection?.collection_version?.version || ''
    }&offset=0&limit=1`
  );

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {};
    if (data) {
      for (const content of data.results[0].docs_blob.contents) {
        let group = groups[content.content_type];
        if (!group) {
          group = {
            name: content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1),
            contents: [],
          };
          groups[content.content_type] = group;
        }

        group.contents.push(content);
      }
    }
    for (const group of Object.values(groups)) {
      group.contents = group.contents
        .filter((content) => content?.content_name?.startsWith(searchText))
        .sort((l, r) => l.content_name.localeCompare(r.content_name));
    }
    return Object.values(groups);
  }, [data, searchText]);

  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const lg = useBreakpoint('lg');

  if (!data && !error) {
    return <LoadingPage />;
  }

  const dataItem = data?.results[0];
  if (error || !dataItem) {
    return (
      <HubError
        error={{ name: '', message: t('Can not load documentation.') }}
        handleRefresh={refresh}
      />
    );
  }

  const { content_type, content_name } = params;

  // find content based on search params
  let content = data?.results[0]?.docs_blob?.contents.find(
    (c) => c.content_name === content_name && c.content_type === content_type
  );

  // for readme, use the root html of all contents
  let html = '';
  if (!content_type) {
    html = dataItem?.docs_blob?.collection_readme?.html || '';
  }

  // if the content has html, lets use that instead of content frontent generation
  if (content?.readme_html) {
    html = content.readme_html;
    content = undefined;
  }

  // prioritize html for rest of cases where html and content is available
  // if the content is available, and html not, try to render documentation in frontend
  if (html && content) {
    content = undefined;
  }

  return (
    <Drawer isExpanded={isDrawerOpen} isInline={lg} position="left">
      <DrawerContent
        panelContent={
          isDrawerOpen ? (
            <CollectionDocumentationTabPanel
              setDrawerOpen={setDrawerOpen}
              groups={groups}
              setSearchText={setSearchText}
            />
          ) : undefined
        }
      >
        <DrawerContentBody className="body hub-docs-content pf-v5-c-content hub-content-alert-fix">
          <div
            style={{ outline: 'none' }}
            tabIndex={0}
            onClick={(event) => {
              event?.currentTarget?.focus();
            }}
            /* listener and role needed for eslint */
            onKeyDown={() => {}}
            role="button"
          >
            {content && (
              <>
                <PageSection variant="light" id="Title_part">
                  <Title headingLevel="h1">
                    {content?.content_type + ' > ' + content?.content_name}
                  </Title>

                  <>
                    <Checkbox
                      onChange={(event, checked) => setRenderJson(checked)}
                      isChecked={renderJson}
                      id="render-json-checkbox"
                    />{' '}
                    {t('Render documentation as JSON')}
                  </>
                  {renderJson && (
                    <>
                      <br />
                      {t(`This will render content of the documentation in user non friendly format, but it will render complete content.
                    Useful in situations, when documentation does not renders everything correctly.`)}
                    </>
                  )}
                  <br />
                </PageSection>
                <CollectionDocumentationTabContent
                  content={content}
                  groups={groups}
                  collection={collection}
                  renderJSON={renderJson}
                />
              </>
            )}
            {html && (
              <div
                dangerouslySetInnerHTML={{
                  __html: html,
                }}
              />
            )}
          </div>
        </DrawerContentBody>
      </DrawerContent>
    </Drawer>
  );
}

export type CollectionVersionContentItem = {
  docs_blob: {
    contents: IContents[];
    collection_readme: {
      html: string;
      name: string;
    };
  };
  license: string[];
};

export type CollectionVersionsContent = {
  count: number;
  next: string;
  previous: string;
  results: CollectionVersionContentItem[];
};
