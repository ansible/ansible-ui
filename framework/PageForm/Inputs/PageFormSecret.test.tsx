/* eslint-disable i18next/no-literal-string */
import { Flex, FlexItem } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { PageFormSecret } from './PageFormSecret';
import { PageFormTextInput } from './PageFormTextInput';

const TestComponent = () => {
  return (
    <Flex>
      <FlexItem>
        <input type="text" placeholder="Enter value" />
      </FlexItem>
      <FlexItem>
        <button>Submit</button>
      </FlexItem>
    </Flex>
  );
};

describe('PageFormSecret', () => {
  describe('autocomplete attribute when field is hidden', () => {
    test('should have autocomplete="new-password" on hidden password input', () => {
      function Wrapper() {
        const methods = useForm({
          defaultValues: { secret: '' },
        });

        return (
          <FormProvider {...methods}>
            <form>
              <PageFormSecret shouldHideField={true} onClear={vi.fn()} label="Secret">
                <PageFormTextInput name="secret" label="Secret" type="password" />
              </PageFormSecret>
            </form>
          </FormProvider>
        );
      }

      const { container } = render(<Wrapper />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;

      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('autocomplete', 'new-password');
      expect(input).toHaveAttribute('disabled');
      expect(input).toHaveAttribute('placeholder', '••••••••••••••••••••••');
    });
  });

  describe('display behavior', () => {
    test('should display hidden value and clear button when shouldHideField is true', () => {
      const { container } = render(
        <PageFormSecret
          shouldHideField={true}
          onClear={() => {}}
          label="Test label"
          labelHelp="Test label Help"
        >
          <TestComponent />
        </PageFormSecret>
      );

      expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
      expect(screen.getByText('Test label')).toBeInTheDocument();
    });

    test('should display children and not display Clear button when shouldHideField is false', () => {
      const { container } = render(
        <PageFormSecret
          shouldHideField={false}
          onClear={() => {}}
          label="Test Label"
          labelHelp="Test Label Help"
        >
          <TestComponent />
        </PageFormSecret>
      );

      expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    });

    test('should invoke onClear when the clear button is clicked and shouldHideField is true', async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <PageFormSecret
          shouldHideField={true}
          onClear={onClear}
          label="Test Label"
          labelHelp="Test Label Help"
        >
          <TestComponent />
        </PageFormSecret>
      );

      await user.click(screen.getByRole('button', { name: /clear/i }));
      expect(onClear).toHaveBeenCalledOnce();
    });
  });
});
