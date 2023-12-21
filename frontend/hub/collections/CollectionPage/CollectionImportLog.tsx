import { useTranslation } from 'react-i18next';
import { useGet } from '../../../common/crud/useGet';
import { HubItemsResponse } from '../../useHubView';
import { hubAPI } from '../../api/formatPath';
import {
  getPatternflyColor,
  PageDetail,
  PageDetails,
  PFColorE,
  Scrollable,
} from '../../../../framework';
import { Alert, CodeBlock, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { StatusCell } from '../../../common/Status';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CollectionImport, CollectionVersionSearch } from '../Collection';

export function CollectionImportLog() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();
  const { data: collectionImportsResponse } = useGet<HubItemsResponse<CollectionImport>>(
    collection
      ? hubAPI`/_ui/v1/imports/collections/?namespace=${
          collection.collection_version?.namespace || ''
        }&name=${collection.collection_version?.name || ''}&version=${
          collection.collection_version?.version || ''
        }&sort=-created&limit=1`
      : ''
  );

  const { data: collectionImport } = useGet<CollectionImport>(
    collectionImportsResponse && collectionImportsResponse.data.length
      ? hubAPI`/_ui/v1/imports/collections/${collectionImportsResponse.data[0].id}/`
      : ''
  );
  // http://ec2-54-147-146-116.compute-1.amazonaws.com:8002/api/automation-hub/_ui/v1/imports/collections/ef7849bd-17f5-434f-b35a-3c1877884d12/

  if (!collection) return <></>;
  // &sort=-created&offset=0&limit=10

  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <PageDetails>
            <PageDetail label={t('Status')}>
              <StatusCell status={collectionImport?.state} />
            </PageDetail>
            {/* <Detail label={t('Approval Status')}>
            </Detail> */}
            <PageDetail label={t('Version')}>{collectionImport?.version}</PageDetail>
          </PageDetails>
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
          <CodeBlock>
            {collectionImport?.messages?.map((message, index) => (
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
          </CodeBlock>
        </Stack>
      </PageSection>
    </Scrollable>
  );
}
