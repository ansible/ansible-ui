import { EmptyStateError } from '@ansible/ansible-ui-framework/components/EmptyStateError';
import { LoadingState } from '@ansible/ansible-ui-framework/components/LoadingState';
import { Alert, CodeBlock, Stack, StackItem } from '@patternfly/react-core';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { NavigationArrow } from '../../common/ImportLogNavigationArrow';
import { getLogMessageColor } from '../../common/utils/getLogMessageColor';
import { ImportStatusBar } from './ImportStatusBar';

const EmptyImportConsole = styled.div`
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pf-t--color--white);
`;

interface IProps {
  collectionImport?: CollectionImport;
  collection?: CollectionVersionSearch;
  isLoading: boolean;
  error?: Error;
}

export function ImportLog({ isLoading, collectionImport, collection, error }: IProps) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  if (error) return <EmptyStateError titleProp={error.name} message={error.message} />;

  if (isLoading) return <LoadingState />;

  return (
    <div ref={ref}>
      {collectionImport && (
        <ImportStatusBar collection={collection} collectionImport={collectionImport} />
      )}
      {collectionImport?.error && (
        <Alert
          style={{ marginTop: '10px' }}
          variant="danger"
          title={
            <Stack>
              {collectionImport?.error?.description
                .split('\n')
                .map((line, index) => <StackItem key={index}>{line}</StackItem>)}
            </Stack>
          }
          isInline
          isExpandable
          data-cy="import-error"
          data-testid="import-error"
        >
          <pre style={{ whiteSpace: 'pre-wrap' }}>{collectionImport?.error?.traceback}</pre>
        </Alert>
      )}
      <CodeBlock
        style={
          {
            marginTop: '10px',
            '--pf-v6-c-code-block--BackgroundColor': 'var(--pf-t--color--gray--95)',
            position: 'relative',
          } as React.CSSProperties
        }
        data-cy="import-console"
        data-testid="import-console"
      >
        <NavigationArrow
          direction="down"
          onClick={() => ref.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })}
        />
        <NavigationArrow
          direction="up"
          onClick={() => ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })}
        />
        {collectionImport ? (
          <>
            {collectionImport.messages?.map((message, index) => (
              <div
                key={index}
                style={{
                  color: getLogMessageColor(message.level),
                }}
              >
                {message.message}
              </div>
            ))}
          </>
        ) : (
          <EmptyImportConsole>{t`No data`}</EmptyImportConsole>
        )}
      </CodeBlock>
    </div>
  );
}
