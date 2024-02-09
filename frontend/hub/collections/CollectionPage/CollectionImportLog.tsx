import { PageSection } from '@patternfly/react-core';
import { useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LoadingPage, Scrollable } from '../../../../framework';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { CollectionImport, CollectionVersionSearch } from '../Collection';
import { HubImportLog } from '../../common/HubImportLog/HubImportLog';

export function CollectionImportLog() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const collectionImportsResponse = useGet<HubItemsResponse<CollectionImport>>(
    collection
      ? hubAPI`/_ui/v1/imports/collections/?namespace=${
          collection.collection_version?.namespace || ''
        }&name=${collection.collection_version?.name || ''}&version=${
          collection.collection_version?.version || ''
        }&sort=-created&limit=1`
      : ''
  );
  const ref = useRef<HTMLDivElement>(null);

  const collectionImportResponse = useGet<CollectionImport>(
    collectionImportsResponse.data && collectionImportsResponse.data.data.length
      ? hubAPI`/_ui/v1/imports/collections/${collectionImportsResponse.data.data[0].id}/`
      : ''
  );

  const collectionImport = collectionImportResponse.data;

  if (collectionImportsResponse.error) {
    return (
      <HubError
        error={collectionImportsResponse.error}
        handleRefresh={collectionImportsResponse.refresh}
      />
    );
  }

  if (collectionImportsResponse.data?.data.length === 0) {
    return <HubError handleRefresh={collectionImportsResponse.refresh} />;
  }

  if (!collectionImportsResponse.error && !collectionImportsResponse.data) {
    return <LoadingPage />;
  }

  if (collectionImportResponse.error) {
    return (
      <HubError
        error={collectionImportsResponse.error}
        handleRefresh={collectionImportResponse.refresh}
      />
    );
  }

  if (!collectionImportResponse.error && !collectionImportResponse.data) {
    return <LoadingPage />;
  }

  const scrollTo = (direction: 'up' | 'down') =>
    ref.current?.scrollIntoView({
      block: direction === 'up' ? 'start' : 'end',
      behavior: 'smooth',
    });

  return (
    <Scrollable>
      <div ref={ref}>
        <PageSection variant="light">
          <HubImportLog
            collectionImport={collectionImport}
            collection={collection}
            scrollTo={scrollTo}
          />
        </PageSection>
      </div>
    </Scrollable>
  );
}
