import { useCollectionColumns } from '../hooks/useCollectionColumns';
import { PageDetails, PageDetailsFromColumns } from '../../../../framework';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';

export function CollectionDetails() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const tableColumns = useCollectionColumns();
  return (
    <PageDetails>
      <PageDetailsFromColumns item={collection} columns={tableColumns} />
    </PageDetails>
  );
}
