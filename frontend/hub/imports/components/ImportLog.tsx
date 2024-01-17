import { useTranslation } from 'react-i18next';
import { getPatternflyColor, PFColorE } from '../../../../framework';
import { Alert, CodeBlock, Stack, StackItem } from '@patternfly/react-core';
import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { ImportStatusBar } from './ImportStatusBar';
import styled from 'styled-components';

const EmptyImportConsole = styled.div`
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface IProps {
  collectionImport?: CollectionImport;
  collection?: CollectionVersionSearch;
}

export function ImportLog({ collectionImport, collection }: IProps) {
  const { t } = useTranslation();

  return (
    <>
      {collectionImport && (
        <ImportStatusBar collection={collection} collectionImport={collectionImport} />
      )}
      {collectionImport?.error && (
        <Alert
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
        >
          <pre>{collectionImport?.error?.traceback}</pre>
        </Alert>
      )}
      <CodeBlock style={{ marginTop: '10px' }}>
        {collectionImport ? (
          <>
            {collectionImport.messages?.map((message, index) => (
              <div
                key={index}
                style={{
                  color: getPatternflyColor(
                    message.level === 'INFO'
                      ? PFColorE.Default
                      : message.level === 'WARNING'
                        ? PFColorE.Warning
                        : message.level === 'ERROR'
                          ? PFColorE.Danger
                          : PFColorE.Disabled
                  ),
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
    </>
  );
}
