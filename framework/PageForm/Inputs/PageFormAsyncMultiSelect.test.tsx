import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PageFormAsyncMultiSelect } from './PageFormAsyncMultiSelect';

vi.mock('../../PageInputs/PageAsyncMultiSelect', () => ({
  PageAsyncMultiSelect: () => <div data-testid="async-multi-select" />,
}));

type FormFields = { values: string[] };

function TestForm() {
  const methods = useForm<FormFields>({ defaultValues: { values: [] } });

  return (
    <FormProvider {...methods}>
      <PageFormAsyncMultiSelect name="values" label="Values" validate={() => 'Validation failed'} />
      <button
        type="button"
        onClick={() => methods.setError('values', { type: 'manual', message: 'Existing error' })}
      >
        Set error
      </button>
    </FormProvider>
  );
}

describe('PageFormAsyncMultiSelect validation message', () => {
  it('shows the field error when validation is not in progress', async () => {
    const user = userEvent.setup();

    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Set error' }));

    expect(screen.getByText('Existing error')).toBeInTheDocument();
  });
});
