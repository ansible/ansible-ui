import React, { useState } from 'react';
import { useOutletContext, Link, useParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { Scrollable, useGetPageUrl } from '../../../../framework';
import { ExecutionEnvironmentImage } from './ExecutionEnvironmentImage';
import {
  DataList,
  DataListItemRow,
  DataListCell,
  DataListItem,
  DataListItemCells,
  Flex,
  FlexItem,
  Card,
  CardBody,
  CardTitle,
  PageSection,
  Title,
} from '@patternfly/react-core';
import { HubRoute } from '../../main/HubRoutes';
import styled from 'styled-components';

const DataListWrapper = styled(FlexItem)`
  max-width: 45%;
  word-wrap: break-word;
`;

const CodeOverflowWrapped = styled.code`
  overflow-wrap: anywhere;
`;

const createLayersFormat = (image: ExecutionEnvironmentImage) => {
  if (!image)
    return {
      digest: '',
      environment: [],
      labels: [],
      layers: [],
    };

  const { config_blob, digest, tags } = image;

  // convert '/bin/sh -c #(nop)  CMD ["sh"]' to 'CMD ["sh"]'
  // but keep anything without #(nop) unchanged
  const parseNop = (str: string) => str.replace(/^.*#\(nop\)\s+(.*)/, '$1');

  // Filter out layers that don't have a "created_by" field.
  const history = config_blob?.data?.history
    ?.filter((item) => 'created_by' in item)
    .map(({ created_by }) => ({
      text: parseNop(created_by),
      // FIXME: size, but no correspondence between the order of history (which have the commands) and layers (which have sizes)
    }));

  return {
    digest,
    environment: config_blob?.data?.config?.Env || [],
    labels: tags || [],
    layers: history || [],
  };
};

export function ExecutionEnvironmentImageDetails() {
  const { image, imageError } = useOutletContext<{
    image: ExecutionEnvironmentImage;
    imageError: Error;
  }>();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { layers, environment } = createLayersFormat(image);

  const [selectedLayer, setSelectedLayer] = useState<string>('layer-0');

  const layerIndex: number = parseInt(selectedLayer.split(/-/)[1]);

  const command = (layers[layerIndex] || {}).text;

  const getPageUrl = useGetPageUrl();

  return (
    <Scrollable>
      <PageSection variant="light">
        {imageError || !image ? (
          <Trans>
            Manifest lists are not currently supported on this screen, please use the{' '}
            <Link to={getPageUrl(HubRoute.ExecutionEnvironmentImages, { params: { id } })}>
              Images
            </Link>{' '}
            tab to see manifest list details.
          </Trans>
        ) : (
          <Flex flexWrap={{ default: 'nowrap' }}>
            <DataListWrapper>
              <DataList
                aria-label={t`Image layers`}
                onSelectDataListItem={(_, id) => {
                  setSelectedLayer(id);
                }}
                selectedDataListItemId={selectedLayer}
              >
                {layers?.map(({ text }, index) => (
                  <DataListItem key={index} id={`layer-${index}`}>
                    <DataListItemRow>
                      <DataListItemCells
                        dataListCells={[
                          <DataListCell key="primary content" className="single-line-ellipsis">
                            <code>{text}</code>
                          </DataListCell>,
                        ]}
                      />
                    </DataListItemRow>
                  </DataListItem>
                ))}
              </DataList>
            </DataListWrapper>

            <FlexItem style={{ flexGrow: '1' }}>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel="h2" size="lg">
                        {t`Command`}
                      </Title>
                    </CardTitle>
                    <CardBody>
                      <CodeOverflowWrapped>{command}</CodeOverflowWrapped>
                    </CardBody>
                  </Card>
                </FlexItem>
                <FlexItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel="h2" size="lg">
                        {t`Environment`}
                      </Title>
                    </CardTitle>
                    <CardBody>
                      {environment.map((line, index) => (
                        <React.Fragment key={index}>
                          <CodeOverflowWrapped>{line}</CodeOverflowWrapped>
                          <br />
                        </React.Fragment>
                      ))}
                    </CardBody>
                  </Card>
                </FlexItem>
              </Flex>
            </FlexItem>
          </Flex>
        )}
      </PageSection>
    </Scrollable>
  );
}
