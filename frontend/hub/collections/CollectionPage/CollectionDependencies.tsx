import { useTranslation } from 'react-i18next';
import { Scrollable } from '../../../../framework';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { CollectionVersionSearch } from '../Collection';

export function CollectionDependencies() {
  const { collection } = useOutletContext<{ collection: CollectionVersionSearch }>();
  const { t } = useTranslation();
  if (!collection?.collection_version?.dependencies) return <></>;
  return (
    <Scrollable>
      <PageSection variant="light">
        <Stack hasGutter>
          <Title headingLevel="h2">{t('Dependencies')}</Title>
          <DescriptionList isHorizontal>
            {Object.keys(collection.collection_version.dependencies).map((key) => {
              return (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {collection.collection_version?.dependencies
                      ? collection.collection_version.dependencies[key]
                      : ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              );
            })}
          </DescriptionList>
        </Stack>
      </PageSection>
    </Scrollable>
  );
}
