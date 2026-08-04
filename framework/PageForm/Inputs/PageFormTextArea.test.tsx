/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test } from 'vitest';
import { PageFormTextArea } from './PageFormTextArea';

describe('PageFormTextArea', () => {
  describe('basic rendering', () => {
    test('should render a textarea with label', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" />
            </form>
          </FormProvider>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    test('should render with placeholder', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea
                name="description"
                label="Description"
                placeholder="Enter description"
              />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('placeholder', 'Enter description');
    });

    test('should render with default value', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: 'Default text' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Default text');
    });

    test('should render disabled textarea', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" isDisabled />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toBeDisabled();
    });

    test('should render read-only textarea', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: 'Read Only' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" isReadOnly />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea).toHaveValue('Read Only');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('user interaction', () => {
    test('should trim leading whitespace on input', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
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

      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onChange' });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" minLength={10} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'short');

      await waitFor(() => {
        expect(screen.getByText(/must be at least 10 characters/i)).toBeInTheDocument();
      });
    });

    test('should validate maxLength', async () => {
      const user = userEvent.setup();

      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' }, mode: 'onChange' });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea name="description" label="Description" maxLength={5} />
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const textarea = container.querySelector('textarea') as HTMLTextAreaElement;
      await user.type(textarea, 'this is way too long');

      await waitFor(() => {
        expect(screen.getByText(/cannot be greater than 5 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('helper text', () => {
    test('should display helper text', () => {
      function Wrapper() {
        const methods = useForm({ defaultValues: { description: '' } });
        return (
          <FormProvider {...methods}>
            <form>
              <PageFormTextArea
                name="description"
                label="Description"
                helperText="Enter a description"
              />
            </form>
          </FormProvider>
        );
      }

      render(<Wrapper />);
      expect(screen.getByText('Enter a description')).toBeInTheDocument();
    });
  });
});
