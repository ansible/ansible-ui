import { FormSection, GridItem } from '@patternfly/react-core';
import { ReactNode, useMemo } from 'react';
import { PageFormGrid } from '../PageForm';

/**
 * Renders a form section with an optional title and children components.
 *
 * This can also be used around an input such as textarea or data editor to ensure the input is rendered in a single column.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.title] - The title of the form section.
 * @param {ReactNode} props.children - The children components to render within the form section.
 * @param {boolean} [props.singleColumn] - Whether to render the children components in a single column.
 * @returns {JSX.Element} - The rendered form section component.
 */
export function PageFormSection(props: {
  title?: string;
  children: ReactNode;
  singleColumn?: boolean;
  isHorizontal?: boolean;
}) {
  const sectionClassNames = useMemo(
    () =>
      props.isHorizontal
        ? ['pf-m-12-col', 'pf-v5-c-form', 'pf-m-horizontal']
        : ['pf-m-12-col', 'pf-v5-c-form'],
    [props.isHorizontal]
  );
  const gridItemClassNames = useMemo(
    () => (props.isHorizontal ? ['pf-v5-c-form', 'pf-m-horizontal'] : ['pf-v5-c-form']),
    [props.isHorizontal]
  );
  if (!props.title) {
    return (
      <GridItem span={12} className={gridItemClassNames.join(' ')}>
        <PageFormGrid singleColumn={props.singleColumn}>{props.children}</PageFormGrid>
      </GridItem>
    );
  }
  return (
    <FormSection
      title={props.title}
      style={{ marginTop: 16 }}
      className={sectionClassNames.join(' ')}
    >
      <PageFormGrid singleColumn={props.singleColumn}>{props.children}</PageFormGrid>
    </FormSection>
  );
}
