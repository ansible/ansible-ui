import { PageDetails, PageDetailsFromColumns } from '@ansible/ansible-ui-framework';
import { useOutletContext } from 'react-router';
import { CollectionVersionSearch } from '../Collection';
import { useCollectionColumns } from '../hooks/useCollectionColumns';

export function CollectionDetails() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const tableColumns = useCollectionColumns();
  return (
    <PageDetails>
      <PageDetailsFromColumns item={collection} columns={tableColumns} />
    </PageDetails>
  );
}
