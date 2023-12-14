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
import { useOutletContext } from 'react-router-dom';
import { CollectionImport, CollectionVersionSearch } from '../Collection';
import styled from 'styled-components';
import { useRef } from 'react';

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
  const ref = useRef<HTMLDivElement>(null);

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
      <div ref={ref}>
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
            <div>
              <CodeBlock
                style={{
                  backgroundColor: 'var(--pf-v5-global--palette--black-850)',
                  position: 'relative',
                }}
              >
                <StyledArrowDown>
                  <span
                    onClick={() => {
                      ref?.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
                    }}
                    className="fa fa-arrow-circle-down clickable"
                  />
                </StyledArrowDown>
                <StyledArrowUp>
                  <span
                    onClick={() => {
                      ref?.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
                    }}
                    className="fa fa-arrow-circle-up clickable"
                  />
                </StyledArrowUp>
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
