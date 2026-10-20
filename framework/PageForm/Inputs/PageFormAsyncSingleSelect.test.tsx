import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { PageFormAsyncSingleSelect } from './PageFormAsyncSingleSelect';

vi.mock('../../PageInputs/PageAsyncSingleSelect', () => ({
  PageAsyncSingleSelect: () => <div data-testid="async-single-select" />,
}));

type FormFields = { value: string };

function TestForm() {
  const methods = useForm<FormFields>({ defaultValues: { value: '' } });

  return (
    <FormProvider {...methods}>
      <PageFormAsyncSingleSelect name="value" label="Value" validate={() => 'Validation failed'} />
      <button
        type="button"
        onClick={() => methods.setError('value', { type: 'manual', message: 'Existing error' })}
      >
        Set error
      </button>
    </FormProvider>
  );
}

describe('PageFormAsyncSingleSelect validation message', () => {
  it('shows the field error when validation is not in progress', async () => {
    const user = userEvent.setup();

    render(<TestForm />);
    await user.click(screen.getByRole('button', { name: 'Set error' }));
    expect(screen.getByText('Existing error')).toBeInTheDocument();
  });
});
