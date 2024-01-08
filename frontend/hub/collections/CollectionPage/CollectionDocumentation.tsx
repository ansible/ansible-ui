import React, { useMemo, useState } from 'react';
import { useGet } from '../../../common/crud/useGet';
import { hubAPI } from '../../api/formatPath';
import { useBreakpoint } from '../../../../framework';
import { Drawer, DrawerContent, DrawerContentBody } from '@patternfly/react-core';
import { useOutletContext } from 'react-router-dom';
import { IContents, CollectionDocs, CollectionVersionSearch } from '../Collection';
import { CollectionDocumentationTabPanel } from '../components/CollectionDocumentationTabPanel';
import { CollectionDocumentationTabContent } from '../components/CollectionDocumentationTabContent';

export function CollectionDocumentation() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();

  const [content, setContent] = useState<IContents>();

  const { data } = useGet<CollectionDocs>(
    hubAPI`/_ui/v1/repo/published/${collection?.collection_version?.name || ''}/${
      collection?.collection_version?.name || ''
    }/?include_related=my_permissions`
  );

  const groups = useMemo(() => {
    const groups: Record<string, { name: string; contents: IContents[] }> = {};
    if (data?.latest_version.docs_blob.contents) {
      for (const content of data.latest_version.docs_blob.contents) {
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
  }, [data?.latest_version.docs_blob.contents]);

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
