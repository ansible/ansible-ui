import { Title } from '@patternfly/react-core';
import { Help } from '@ansible/ansible-ui-framework';

export function DashboardSectionHeading(
  props: Readonly<{ title: string; help?: string; size?: 'lg' | 'md' }>
) {
  const { title, help, size = 'lg' } = props;
  return (
    <>
      <Title
        headingLevel="h4"
        size={size}
        style={{ display: 'inline-block', verticalAlign: '-0.15em', lineHeight: 1.2 }}
      >
        {title}
      </Title>
      {help ? <Help title={title} help={help} /> : null}
    </>
  );
}
