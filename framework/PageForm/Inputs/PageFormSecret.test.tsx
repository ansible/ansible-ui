/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PageFormSecret } from './PageFormSecret';
import { PageFormTextInput } from './PageFormTextInput';
import { useForm, FormProvider } from 'react-hook-form';

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
});
