/* eslint-disable i18next/no-literal-string */
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PageForm } from './PageForm';
import { PageFormTextInput } from './Inputs/PageFormTextInput';
import { PageFormTextArea } from './Inputs/PageFormTextArea';

describe('PageForm', () => {
  describe('disableSubmitOnEnter behavior', () => {
    test('should prevent Enter key in text input when disableSubmitOnEnter is true', async () => {
      const onSubmit = vi.fn();

      render(
        <PageForm onSubmit={onSubmit} disableSubmitOnEnter>
          <PageFormTextInput name="text" label="Text" />
        </PageForm>
      );

      const input = screen.getByRole('textbox', { name: /text/i });
      await userEvent.type(input, 'test');

      // Simulate Enter key press
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      // Form should not be submitted
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('should allow Enter key in textarea for new line when disableSubmitOnEnter is true', async () => {
      const onSubmit = vi.fn();

      render(
        <PageForm onSubmit={onSubmit} disableSubmitOnEnter>
          <PageFormTextArea name="description" label="Description" />
        </PageForm>
      );

      const textarea = screen.getByRole('textbox', { name: /description/i });

      // Type some text, then Enter, then more text
      await userEvent.type(textarea, 'line 1{Enter}line 2');

      // The textarea should contain a newline
      expect(textarea).toHaveValue('line 1\nline 2');

      // Form should not be submitted
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('should not prevent Enter key when disableSubmitOnEnter is false', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      render(
        <PageForm onSubmit={onSubmit} disableSubmitOnEnter={false}>
          <PageFormTextInput name="text" label="Text" />
        </PageForm>
      );

      const input = screen.getByRole('textbox', { name: /text/i });
      await userEvent.type(input, 'test{Enter}');

      // Form should be submitted (Enter triggers form submission)
      expect(onSubmit).toHaveBeenCalled();
    });
  });
});
