import { Alert, Stack, StackItem } from '@patternfly/react-core';
import { CollectionImport } from '../../collections/Collection';

export interface ImportErrorProps {
  collectionImport: CollectionImport;
}

export function ImportError({ collectionImport }: ImportErrorProps) {
  return (
    <Alert
      variant="danger"
      title={
        <Stack>
          {collectionImport?.error?.description
            .split('\n')
            .map((line: string, index: number) => <StackItem key={index}>{line}</StackItem>)}
        </Stack>
      }
      isInline
      isExpandable
      data-cy="import-error"
    >
      <pre style={{ whiteSpace: 'pre-wrap' }}>{collectionImport?.error?.traceback}</pre>
    </Alert>
  );
}
