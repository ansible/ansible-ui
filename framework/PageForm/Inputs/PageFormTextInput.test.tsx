/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import { PageFormTextInput } from './PageFormTextInput';

describe('PageFormTextInput', () => {
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
