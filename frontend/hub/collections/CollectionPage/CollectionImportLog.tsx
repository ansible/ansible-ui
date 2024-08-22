import { CodeBlock, PageSection, Stack } from '@patternfly/react-core';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import { LoadingPage, PFColorE, PageDetail, PageDetails, Scrollable } from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { NavigationArrow } from '../../common/ImportLogNavigationArrow';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { getLogMessageColor } from '../../common/utils/getLogMessageColor';
import { CollectionImport, CollectionVersionSearch } from '../Collection';

export function CollectionImportLog() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();
  const {
    data: collectionImportsResponse,
    isLoading: collectionImportsisLoading,
    error: collectionImportsError,
    refresh: collectionImportsRefresh,
  } = useGet<HubItemsResponse<CollectionImport>>(
    collection
      ? hubAPI`/_ui/v1/imports/collections/?namespace=${
          collection.collection_version?.namespace || ''
        }&name=${collection.collection_version?.name || ''}&version=${
          collection.collection_version?.version || ''
        }&sort=-created&limit=1`
      : ''
  );
  const ref = useRef<HTMLDivElement>(null);

  const {
    data: collectionImportDetail,
    isLoading: collectionImportDetailIsLoading,
    error: collectionImportDetailError,
    refresh: collectionImportDetailRefresh,
  } = useGet<CollectionImport>(
    collectionImportsResponse && collectionImportsResponse.data.length
      ? hubAPI`/_ui/v1/imports/collections/${collectionImportsResponse.data[0].id}/`
      : ''
  );
  if (collectionImportsisLoading || collectionImportDetailIsLoading) {
    return <LoadingPage />;
  }

  if (collectionImportsError || collectionImportsResponse?.data.length === 0) {
    return <HubError error={collectionImportsError} handleRefresh={collectionImportsRefresh} />;
  }

  if (collectionImportDetailError && !collectionImportDetail) {
    return (
      <HubError error={collectionImportDetailError} handleRefresh={collectionImportDetailRefresh} />
    );
  }

  let approvalStatus = t`waiting for import to finish`;

  if (collection) {
    const pipeline = collection.repository?.pulp_labels?.pipeline;
    if (pipeline === 'rejected') {
      approvalStatus = t`rejected`;
    } else if (pipeline === 'staging') {
      approvalStatus = t`waiting for approval`;
    } else if (pipeline === 'approved') {
      approvalStatus = t`approved`;
    } else {
      approvalStatus = t`could not be determined yet`;
    }
  }

  return (
    <Scrollable>
      <div ref={ref}>
        <PageSection variant="light">
          {collectionImportDetail && (
            <Stack hasGutter>
              <PageDetails>
                <PageDetail label={t('Status')}>
                  <StatusCell status={collectionImportDetail.state} />
                </PageDetail>
                <PageDetail label={t('Approval status')}>
                  <StatusCell status={approvalStatus} />
                </PageDetail>
                <PageDetail label={t('Version')}>{collectionImportDetail.version}</PageDetail>
              </PageDetails>
              <div>
                <CodeBlock
                  data-cy="import-log"
                  style={{
                    backgroundColor: 'var(--pf-v5-global--palette--black-850)',
                    position: 'relative',
                  }}
                >
                  <NavigationArrow
                    direction="down"
                    onClick={() =>
                      ref.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })
                    }
                  />

                  <NavigationArrow
                    direction="up"
                    onClick={() =>
                      ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                    }
                  />

                  {collectionImportDetail?.messages?.map((message, index) => (
                    <div
                      key={index}
                      style={{
                        color: getLogMessageColor(message.level),
                      }}
                    >
                      {message.message}
                    </div>
                  ))}
                  <br />
                  <div
                    key={'done'}
                    style={{
                      color: PFColorE.Green,
                    }}
                  >{t`Done`}</div>
                </CodeBlock>
              </div>
            </Stack>
          )}
        </PageSection>
      </div>
    </Scrollable>
  );
}
