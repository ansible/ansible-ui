/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { PageFormTextInput } from './PageFormTextInput';

describe('PageFormTextInput', () => {
  describe('min/max value clamping for number type', () => {
    test('should clamp value to max when typing exceeds max', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { quantity: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="quantity" label="Quantity" type="number" min={0} max={10} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;

      await user.type(input, '999');

      // The component clamps values to the max
      await waitFor(() => {
        expect(input.value).toBe('10');
      });
    });

    test('should clamp value to min when typing below min', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { quantity: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput
                name="quantity"
                label="Quantity"
                type="number"
                min={10}
                max={100}
              />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;

      await user.type(input, '5');

      // The component clamps values to the min
      await waitFor(() => {
        expect(input.value).toBe('10');
      });
    });

    test('should accept valid number within min/max range without clamping', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { quantity: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="quantity" label="Quantity" type="number" min={5} max={100} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;

      await user.type(input, '50');
      await waitFor(() => {
        expect(input.value).toBe('50');
      });
    });

    test('should set value to null when input is empty', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { quantity: 50 },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="quantity" label="Quantity" type="number" min={0} max={100} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="number"]') as HTMLInputElement;

      await user.clear(input);
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  describe('minLength/maxLength validation for text type', () => {
    test('should validate minLength correctly for text input', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { name: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="name" label="Name" type="text" minLength={5} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;

      await user.type(input, 'abc');
      await waitFor(() => {
        expect(screen.getByText(/must be at least 5 characters/i)).toBeInTheDocument();
      });
    });

    test('should validate maxLength correctly for text input', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { name: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="name" label="Name" type="text" maxLength={10} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;

      await user.type(input, 'this is a very long string');
      await waitFor(() => {
        expect(screen.getByText(/cannot be greater than 10 characters/i)).toBeInTheDocument();
      });
    });

    test('should not show error when text length is within valid range', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({
          defaultValues: { name: '' },
          mode: 'onChange',
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput
                name="name"
                label="Name"
                type="text"
                minLength={3}
                maxLength={10}
              />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;

      await user.type(input, 'hello');
      await waitFor(() => {
        expect(screen.queryByText(/must be at least/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/cannot be greater than/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('autocomplete attribute for password fields', () => {
    test('should have autocomplete="new-password" by default for password type', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { password: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="password" label="Password" type="password" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('autocomplete', 'new-password');
    });

    test('should toggle password visibility without changing autocomplete', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { password: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="password" label="Password" type="password" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;

      expect(input).toHaveAttribute('autocomplete', 'new-password');
    });
  });

  describe('autocomplete attribute for non-password fields', () => {
    test('should have autocomplete="off" by default for text type', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { username: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="username" label="Username" type="text" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    test('should use custom autocomplete value for email type', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { email: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="email" label="Email" type="email" autoComplete="email" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="email"]') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('autocomplete', 'email');
    });

    test('should have autocomplete="off" by default when type is not specified', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { field: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextInput name="field" label="Field" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('autocomplete', 'off');
    });
  });
});
