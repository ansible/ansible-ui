import { Alert, PageSection } from '@patternfly/react-core';

export function DetailInfo(props: { title: string; description?: string; isPlain?: boolean }) {
  const { title, description, isPlain = true } = props;
  return (
    <PageSection variant="light">
      <Alert isInline isPlain={isPlain} variant="info" title={title}>
        {description && <p>{description}</p>}
      </Alert>
    </PageSection>
  );
}
