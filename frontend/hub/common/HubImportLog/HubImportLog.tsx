import { Stack } from '@patternfly/react-core';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { ImportStatusBar } from './ImportStatusBar';
import { ImportError } from './ImportError';
import { ImportConsole, ImportConsoleProps } from './ImportConsole';

export interface HubImportLogProps extends ImportConsoleProps {
  collectionImport?: CollectionImport;
  collection?: CollectionVersionSearch;
  minMessagesToShowNavigationArrows?: number;
  elementsGap?: string;
}

export function HubImportLog({
  collectionImport,
  collection,
  minMessagesToShowNavigationArrows = 25,
  scrollTo,
}: HubImportLogProps) {
  return (
    <Stack hasGutter>
      {collectionImport && (
        <ImportStatusBar collection={collection} collectionImport={collectionImport} />
      )}

      {collectionImport?.state === 'failed' && <ImportError collectionImport={collectionImport} />}

      <ImportConsole
        collectionImport={collectionImport}
        scrollTo={scrollTo}
        minMessagesToShowNavigationArrows={minMessagesToShowNavigationArrows}
      />
    </Stack>
  );
}
