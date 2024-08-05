import {
  ToggleGroup,
  ToggleGroupItem,
  Drawer,
  DrawerContent,
  DrawerContentBody,
} from '@patternfly/react-core';
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

/*
Documentation content is divided into list of contents. The list include content_name and content_type.
This is rendered in the left part as menu, where content_type is main menu item and conent_name is in submenu.

Special case is readme, which is in its separate "folder".

While selecting some item, its content is rendered into the right part of page. Some contents (including readme) are provided directly in the html, so they are injected into div. Others came as complex object that includes information about the documentation.

The object is passed into the renderer component that loops over the items inside the object and tries to render them.
Some content is more complicated, because it has to be rendered recursively, for example parameters, which can contains
subparameters (and those can contain subparameters), others are simple string like 'short_description', which are direclty rendered.

Then there is parser. Because some strings (usualy in the descriptions) can contain some formating. We are using antsibull-docs, which returns
parsed string with parsed elements and their informations. We then render them, for example, we can render links, highlight some info and such.
*/
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

  // create groups for left tab of contents menu
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

  const docsFiles = useMemo(() => {
    let files:
      | {
          label: string;
          name: string;
        }[]
      | [] = [];
    if (data?.results[0].docs_blob) {
      const { docs_blob } = data.results[0];
      files = docs_blob.documentation_files.map(({ name }) => ({
        label: name.charAt(0).toUpperCase() + name.slice(1).split('.')[0],
        name: name.split('.')[0],
      }));
    }
    return [
      ...files,
      {
        name: 'readme',
        label: t('Readme'),
      },
    ]
      ?.filter(({ name }) => name.startsWith(searchText.toLowerCase()))
      .sort((l, r) => l.name.localeCompare(r.name));
  }, [data, searchText, t]);

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
  if (!content_type && !content_name) {
    html = dataItem?.docs_blob?.collection_readme?.html || '';
  }
  if (!content_type && content_name) {
    html =
      data.results[0].docs_blob.documentation_files.find((c) => c.name.startsWith(content_name))
        ?.html || '';
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
    <Drawer isExpanded isInline={lg} position="left">
      <DrawerContent
        panelContent={
          <CollectionDocumentationTabPanel
            groups={groups}
            setSearchText={setSearchText}
            searchText={searchText}
            docs={docsFiles}
          />
        }
      >
        <DrawerContentBody className="body hub-docs-content pf-v5-c-content hub-content-alert-fix">
          {/* This enables scrolling using keyboard after click into the content*/}
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

                  {/* ToggleGroup allows switch between rendered docs in HTML and between plain JSON that displays raw documentation data*/}
                  <>
                    <ToggleGroup>
                      <ToggleGroupItem
                        text={t('html')}
                        key={0}
                        buttonId="toggle-group-multiple-1"
                        isSelected={!renderJson}
                        onChange={() => {
                          setRenderJson(false);
                        }}
                      />
                      <ToggleGroupItem
                        text={t('json')}
                        key={1}
                        buttonId="toggle-group-multiple-2"
                        isSelected={renderJson}
                        onChange={() => {
                          setRenderJson(true);
                        }}
                      />
                    </ToggleGroup>
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
            {/* If html is available, insert it directly */}
            {html && (
              <PageSection variant="light" id="HTML_doc">
                <div
                  dangerouslySetInnerHTML={{
                    __html: html,
                  }}
                />
              </PageSection>
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
    documentation_files: { name: string; html: string }[];
  };
  license: string[];
};

export type CollectionVersionsContent = {
  count: number;
  next: string;
  previous: string;
  results: CollectionVersionContentItem[];
};
