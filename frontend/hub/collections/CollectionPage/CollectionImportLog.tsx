import { Alert, CodeBlock, PageSection, Stack, StackItem } from '@patternfly/react-core';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router-dom';
import styled from 'styled-components';
import {
  LoadingPage,
  PFColorE,
  PageDetail,
  PageDetails,
  Scrollable,
  getPatternflyColor,
} from '../../../../framework';
import { StatusCell } from '../../../common/Status';
import { useGet } from '../../../common/crud/useGet';
import { HubError } from '../../common/HubError';
import { hubAPI } from '../../common/api/formatPath';
import { HubItemsResponse } from '../../common/useHubView';
import { CollectionImport, CollectionVersionSearch } from '../Collection';

export function CollectionImportLog() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();
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
          <Stack hasGutter>
            <PageDetails>
              <PageDetail label={t('Status')}>
                <StatusCell status={collectionImport?.state} />
              </PageDetail>
              <PageDetail label={t('Approval status')}>
                <StatusCell status={approvalStatus} />
              </PageDetail>
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
            <div>
              <CodeBlock
                style={{
                  backgroundColor: 'var(--pf-v5-global--palette--black-850)',
                  position: 'relative',
                }}
              >
                <NavigationArrow
                  direction="down"
                  onClick={() => ref.current?.scrollIntoView({ block: 'end', behavior: 'smooth' })}
                />

                <NavigationArrow
                  direction="up"
                  onClick={() =>
                    ref.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                  }
                />

                {collectionImport?.messages?.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      color: getColor(message.level),
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
        </PageSection>
      </div>
    </Scrollable>
  );
}

function getColor(messageLevel: string) {
  const res = getPatternflyColor(
    messageLevel === 'WARNING'
      ? PFColorE.Warning
      : messageLevel === 'ERROR'
        ? PFColorE.Danger
        : PFColorE.Disabled
  );

  if (messageLevel === 'INFO') {
    return 'white';
  }
  return res;
}

const arrowStyle = `
  color: white;
  &:hover {
    cursor: pointer;
  }
  position: absolute;
  margin-bottom: 10px;
  margin-right: 10px;
  font-size: 120%;
`;

const StyledArrowDown = styled.div`
  ${arrowStyle}
  right: 0; /* Aligns the icon to the right */
  top: 0; /* Aligns the icon to the top */
`;

const StyledArrowUp = styled.div`
  ${arrowStyle}
  right: 0;
  bottom: 0;
`;

function NavigationArrow(props: { direction: 'up' | 'down'; onClick: () => void }) {
  const className = `fa fa-arrow-circle-${props.direction} clickable`;

  const Component = props.direction === 'up' ? StyledArrowUp : StyledArrowDown;

  return (
    <Component>
      <span
        role="button"
        onClick={() => {
          props.onClick();
        }}
        onKeyDown={(event) => {
          // Trigger click on Enter key
          if (event.key === 'Enter') {
            props.onClick();
          }
        }}
        tabIndex={props.direction === 'up' ? 0 : 1} // Make the element focusable
        className={className}
      />
    </Component>
  );
}
