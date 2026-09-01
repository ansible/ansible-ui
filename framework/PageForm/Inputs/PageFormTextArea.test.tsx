/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { PageFormOptionsContext } from '../PageFormOptionsContext';
import { PageFormTextArea } from './PageFormTextArea';

function DefaultWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  const methods = useForm({ defaultValues: { description: '' } });
  return (
    <FormProvider {...methods}>
      <form>{children}</form>
    </FormProvider>
  );
}

describe('PageFormTextArea', () => {
  describe('basic rendering', () => {
    test('should render a textarea with label', () => {
      render(
        <DefaultWrapper>
          <PageFormTextArea name="description" label="Description" />
        </DefaultWrapper>
      );
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      const { container } = render(
        <DefaultWrapper>
          <PageFormTextArea
            name="description"
            label="Description"
            placeholder="Enter description"
          />
        </DefaultWrapper>
      );
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('placeholder', 'Enter description');
    });

    test('should render with default value', () => {
      function WrapperWithDefault() {
        const methods = useForm({ defaultValues: { description: 'Default text' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<WrapperWithDefault />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Default text');
    });

    test('should render disabled textarea', () => {
      const { container } = render(
        <DefaultWrapper>
          <PageFormTextArea name="description" label="Description" isDisabled />
        </DefaultWrapper>
      );
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    test('should render read-only textarea', () => {
      function WrapperWithReadOnly() {
        const methods = useForm({ defaultValues: { description: 'Read Only' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" isReadOnly />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<WrapperWithReadOnly />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Read Only');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('user interaction', () => {
    test('should trim leading whitespace on input', async () => {
      const user = userEvent.setup();

      const { container } = render(
        <DefaultWrapper>
          <PageFormTextArea name="description" label="Description" />
        </DefaultWrapper>
      );
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, '  hello');

      await waitFor(() => {
        expect(textarea).toHaveValue('hello');
      });
    });
  });

  describe('validation', () => {
    test('should validate minLength', async () => {
      const user = userEvent.setup();

      function ValidationWrapper() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onChange' });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" minLength={10} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<ValidationWrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'short');

      await waitFor(() => {
        expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    test('should validate maxLength', async () => {
      const user = userEvent.setup();

      function ValidationWrapper() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onChange' });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" maxLength={5} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<ValidationWrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'this is way too long');

      await waitFor(() => {
        expect(screen.getByText(/cannot be greater than 5 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('helper text', () => {
    test('should display helper text', () => {
      render(
        <DefaultWrapper>
          <PageFormTextArea
            name="description"
            label="Description"
            helperText="Enter a description"
          />
        </DefaultWrapper>
      );
      expect(screen.getByText('Enter a description')).toBeInTheDocument();
    });
  });

  describe('select lookup button', () => {
    test('should render lookup button when selectTitle is provided', () => {
      function WrapperWithSelect() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea
                name="description"
                label="Description"
                selectTitle="Browse"
                selectOpen={() => undefined}
                selectValue={() => 'selected-value'}
              />
            </form>
          </FormProvider>
        );
      }

      render(<WrapperWithSelect />);
      expect(screen.getByRole('button', { name: 'Options menu' })).toBeInTheDocument();
    });

    test('should call selectOpen when lookup button is clicked', async () => {
      const user = userEvent.setup();
      const selectOpen = vi.fn((callback: (item: { value: string }) => void) => {
        callback({ value: 'selected-value' });
      });

      function WrapperWithSelect() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea
                name="description"
                label="Description"
                selectTitle="Browse"
                selectOpen={selectOpen}
                selectValue={(item: { value: string }) => item.value}
              />
            </form>
          </FormProvider>
        );
      }

      render(<WrapperWithSelect />);
      await user.click(screen.getByRole('button', { name: 'Options menu' }));
      expect(selectOpen).toHaveBeenCalledWith(expect.any(Function), 'Browse');
    });
  });

  describe('OPTIONS-driven validation', () => {
    test('should apply pattern validation when field is dirty', async () => {
      const user = userEvent.setup();

      function WrapperWithOptions() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onBlur' });
        const optionsContext = {
          fields: {
            description: {
              pattern: '^[a-zA-Z ]+$',
              pattern_description: 'Description must contain only letters and spaces',
            },
          },
        };
        return (
          <PageFormOptionsContext.Provider value={optionsContext}>
            <FormProvider {...methods}>
              <form>
                <PageFormTextArea name="description" label="Description" />
              </form>
            </FormProvider>
          </PageFormOptionsContext.Provider>
        );
      }

      const { container } = render(<WrapperWithOptions />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

      // Type an invalid value (contains number)
      await user.type(textarea, 'invalid123');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('Description must contain only letters and spaces')
        ).toBeInTheDocument();
      });
    });

    test('should skip pattern validation when field is not dirty', async () => {
      const user = userEvent.setup();

      function WrapperWithOptions() {
        const methods = useForm({ defaultValues: { description: 'existing123' }, mode: 'onBlur' });
        const optionsContext = {
          fields: {
            description: {
              pattern: '^[a-zA-Z ]+$',
              pattern_description: 'Description must contain only letters and spaces',
            },
          },
        };
        return (
          <PageFormOptionsContext.Provider value={optionsContext}>
            <FormProvider {...methods}>
              <form>
                <PageFormTextArea name="description" label="Description" />
              </form>
            </FormProvider>
          </PageFormOptionsContext.Provider>
        );
      }

      const { container } = render(<WrapperWithOptions />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

      // Blur without changing the value
      await user.click(textarea);
      await user.tab();

      // Should not show validation error for unchanged field
      await waitFor(
        () => {
          expect(
            screen.queryByText('Description must contain only letters and spaces')
          ).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    test('should not apply pattern validation when no OPTIONS context', async () => {
      const user = userEvent.setup();

      function WrapperWithoutOptions() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onBlur' });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<WrapperWithoutOptions />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

      // Type an invalid value (would fail pattern if it were applied)
      await user.type(textarea, 'invalid123');
      await user.tab();

      // Should not show validation error
      await waitFor(
        () => {
          expect(screen.queryByText(/must contain only/)).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    test('should pass validation when value matches pattern', async () => {
      const user = userEvent.setup();

      function WrapperWithOptions() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onBlur' });
        const optionsContext = {
          fields: {
            description: {
              pattern: '^[a-zA-Z ]+$',
              pattern_description: 'Description must contain only letters and spaces',
            },
          },
        };
        return (
          <PageFormOptionsContext.Provider value={optionsContext}>
            <FormProvider {...methods}>
              <form>
                <PageFormTextArea name="description" label="Description" />
              </form>
            </FormProvider>
          </PageFormOptionsContext.Provider>
        );
      }

      const { container } = render(<WrapperWithOptions />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;

      // Type a valid value
      await user.type(textarea, 'Valid description');
      await user.tab();

      // Should not show validation error
      await waitFor(
        () => {
          expect(screen.queryByText(/must contain only/)).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });
});
