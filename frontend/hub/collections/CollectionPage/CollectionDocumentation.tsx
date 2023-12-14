import React, { useMemo, useState } from 'react';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI, pulpAPI } from '../../api/formatPath';
import { useBreakpoint } from '../../../../framework';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useOutletContext } from 'react-router-dom';
import { IContents, CollectionDocs, CollectionVersionSearch } from '../Collection';
import { CollectionDocumentationTabPanel } from '../components/CollectionDocumentationTabPanel';
import { CollectionDocumentationTabContent } from '../components/CollectionDocumentationTabContent';
import { CollectionVersionListResponse } from '../../api-schemas/generated/CollectionVersionListResponse';

export function CollectionDocumentation() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  const [content, setContent] = useState<IContents>();

  const { data } = useGet<CollectionVersionsContent>(
    pulpAPI`/content/ansible/collection_versions/?namespace=${
      collection?.collection_version?.namespace || ''
    }&name=${collection?.collection_version?.name || ''}&version=${
      collection?.collection_version?.version || ''
    }&offset=0&limit=1`
  );

  type CollectionVersionsContent = {
    count: number;
    next: string;
    previous: string;
    results: unknown[];
  };

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {};
    if (data) {
      for (const content of data.results[0].docs_blob.contents) {
        let group = groups[content.content_type];
        if (!group)  {
          group = {
            name: content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1),
            contents: [],
          };
        }
        groups[content.content_type] = group;
        }
        groups.contents.push(content);
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
