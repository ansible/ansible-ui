/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Controller, useFormContext } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { GenericForm } from './GenericForm';

interface IFormValues {
  name: string;
  email: string;
}

function TestInputs() {
  const { control } = useFormContext<IFormValues>();
  return (
    <>
      <Controller
        name="name"
        control={control}
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div>
            <label htmlFor="name-input">Name</label>
            <input id="name-input" value={value} onChange={(e) => onChange(e.target.value)} />
            {error && <span>{error.message}</span>}
          </div>
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field: { onChange, value } }) => (
          <div>
            <label htmlFor="email-input">Email</label>
            <input id="email-input" value={value} onChange={(e) => onChange(e.target.value)} />
          </div>
        )}
      />
      <button type="submit">Submit</button>
    </>
  );
}

describe('GenericForm', () => {
  test('should render form with children', () => {
    render(
      <GenericForm<IFormValues> onSubmit={vi.fn()} defaultValue={{ name: '', email: '' }}>
        <TestInputs />
      </GenericForm>
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  test('should submit form with entered values', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GenericForm<IFormValues> onSubmit={onSubmit} defaultValue={{ name: '', email: '' }}>
        <TestInputs />
      </GenericForm>
    );

    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.type(screen.getByLabelText('Email'), 'john@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        { name: 'John Doe', email: 'john@example.com' },
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  test('should display validation errors from form rules', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <GenericForm<IFormValues> onSubmit={onSubmit} defaultValue={{ name: '', email: '' }}>
        <TestInputs />
      </GenericForm>
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should display error alert when onSubmit throws', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Server error occurred';

    render(
      <GenericForm<IFormValues>
        onSubmit={() => {
          throw new Error(errorMessage);
        }}
        defaultValue={{ name: 'test', email: '' }}
      >
        <TestInputs />
      </GenericForm>
    );

    await user.type(screen.getByLabelText('Name'), 'Valid Name');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('should display error alert when onSubmit rejects', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Async error occurred';

    render(
      <GenericForm<IFormValues>
        onSubmit={() => Promise.reject(new Error(errorMessage))}
        defaultValue={{ name: 'test', email: '' }}
      >
        <TestInputs />
      </GenericForm>
    );

    await user.type(screen.getByLabelText('Name'), 'Valid Name');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('should render with default values', () => {
    render(
      <GenericForm<IFormValues>
        onSubmit={vi.fn()}
        defaultValue={{ name: 'Default Name', email: 'default@test.com' }}
      >
        <TestInputs />
      </GenericForm>
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Default Name');
    expect(screen.getByLabelText('Email')).toHaveValue('default@test.com');
  });

  test('should support vertical layout', () => {
    const { container } = render(
      <GenericForm<IFormValues>
        onSubmit={vi.fn()}
        defaultValue={{ name: '', email: '' }}
        isVertical
      >
        <TestInputs />
      </GenericForm>
    );

    const form = container.querySelector('form');
    expect(form).not.toHaveClass('pf-m-horizontal');
  });
});
