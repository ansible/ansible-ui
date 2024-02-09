import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { LoadingState } from '../../../../framework/components/LoadingState';
import { EmptyStateError } from '../../../../framework/components/EmptyStateError';
import { HubImportLog } from '../../common/HubImportLog/HubImportLog';
import { ScrollToType } from '../../common/HubImportLog/ImportConsole';

interface IProps {
  collectionImport?: CollectionImport;
  collection?: CollectionVersionSearch;
  isLoading: boolean;
  error?: Error;
  scrollTo?: ScrollToType;
}

export function ImportLog({ isLoading, collectionImport, collection, error, scrollTo }: IProps) {
  if (error) return <EmptyStateError titleProp={error.name} message={error.message} />;

  if (isLoading) return <LoadingState />;

  return (
    <HubImportLog collectionImport={collectionImport} collection={collection} scrollTo={scrollTo} />
  );
}
