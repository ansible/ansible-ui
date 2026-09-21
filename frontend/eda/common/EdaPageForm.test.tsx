import { PageFormTextInput } from '@ansible/ansible-ui-framework/PageForm/Inputs/PageFormTextInput';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { EdaPageForm } from './EdaPageForm';

describe('EdaPageForm', () => {
  it('should apply pattern validation from optionsData', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <EdaPageForm
        submitText="Save"
        onSubmit={onSubmit}
        onCancel={() => {}}
        defaultValue={{ name: '' }}
        optionsData={{
          actions: {
            POST: {
              name: {
                pattern: '^[a-zA-Z0-9_-]+$',
                pattern_description: 'Letters, numbers, underscores, and hyphens only',
              },
            },
          },
        }}
      >
        <PageFormTextInput name="name" label="Name" />
      </EdaPageForm>
    );

    const input = screen.getByLabelText('Name');
    await user.type(input, 'invalid@name');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Letters, numbers, underscores, and hyphens only')
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
