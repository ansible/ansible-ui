import { Alert, PageSection } from '@patternfly/react-core';

export function DetailInfo(props: { title: string; description?: string }) {
  const { title, description } = props;
  return (
    <PageSection variant="light">
      <Alert isInline isPlain variant="info" title={title}>
        {description && <p>{description}</p>}
      </Alert>
    </PageSection>
  );
}
