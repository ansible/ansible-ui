import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { MappingAttributesSubform } from './MappingAttributesSubform';

function Wrapper(props: Readonly<{ attributeCount: number }>) {
  const methods = useForm({
    defaultValues: {
      attributes: Array.from({ length: props.attributeCount }, (_, i) => ({
        attribute: `attr${i}`,
        comparison: 'contains',
        value: `v${i}`,
      })),
    },
  });
  return (
    <FormProvider {...methods}>
      <MappingAttributesSubform />
    </FormProvider>
  );
}

describe('MappingAttributesSubform', () => {
  it('removes an attribute when delete is available with multiple rows', async () => {
    const user = userEvent.setup();

    render(<Wrapper attributeCount={2} />);

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete attribute' });
    expect(deleteButtons).toHaveLength(2);

    await user.click(deleteButtons[0]!);

    expect(screen.queryByRole('button', { name: 'Delete attribute' })).not.toBeInTheDocument();
  });
});
