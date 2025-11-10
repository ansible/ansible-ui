import { PageSection } from '@patternfly/react-core';
import { Domains } from '../../common/domains/Domains';
import { TemplatesList, TemplatesListProps } from './TemplatesList';

export function TemplatesListWithDomains(props: Readonly<TemplatesListProps>) {
  return (
    <>
      <PageSection>
        <Domains />
      </PageSection>
      <TemplatesList {...props} />
    </>
  );
}
