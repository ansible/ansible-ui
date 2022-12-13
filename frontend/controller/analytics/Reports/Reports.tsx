import { PageBody, PageHeader, PageLayout, PageTable } from '../../../../framework';
import { Bullseye, Page, PageSection, Spinner } from '@patternfly/react-core';

export function Reports() {
  return (
    <Page>
      <PageLayout>
        <PageHeader title={'Reports'} description={'Here goes description'} />
        <PageSection isFilled variant="light">
          <Bullseye>
            <Spinner />
          </Bullseye>
        </PageSection>
      </PageLayout>
    </Page>
  );
}
