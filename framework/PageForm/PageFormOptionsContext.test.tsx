import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageForm } from './PageForm';
import { PageFormTextInput } from './Inputs/PageFormTextInput';

describe('PageFormOptionsContext', () => {
  const mockOptionsData = {
    actions: {
      POST: {
        name: {
          pattern: '^[a-zA-Z0-9_-]+$',
          pattern_description: 'Name must contain only letters, numbers, underscores, and hyphens',
        },
        description: {
          pattern: '^[a-zA-Z ]+$',
          pattern_description: 'Description must contain only letters and spaces',
        },
      },
    },
  };

  it('should apply pattern validation when field is dirty and pattern exists', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={mockOptionsData}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type an invalid value (contains special character @)
    await user.type(input, 'invalid@name');

    // Blur to trigger validation
    await user.click(document.body);

    // Wait for validation error
    await waitFor(() => {
      expect(
        screen.getByText('Name must contain only letters, numbers, underscores, and hyphens')
      ).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should skip pattern validation when field is not dirty (grandfathering)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    // Set default value that violates the pattern (contains @)
    render(
      <PageForm
        onSubmit={onSubmit}
        defaultValue={{ name: 'existing@name' }}
        optionsData={mockOptionsData}
      >
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Blur without changing the value
    await user.click(input);
    await user.tab();

    // Wait to ensure no validation error appears
    await waitFor(
      () => {
        expect(
          screen.queryByText('Name must contain only letters, numbers, underscores, and hyphens')
        ).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should not apply pattern validation when optionsData is not provided', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type an invalid value (would fail pattern if it were applied)
    await user.type(input, 'invalid@name');
    await user.tab();

    // Wait to ensure no validation error appears
    await waitFor(
      () => {
        expect(screen.queryByText(/must contain only/)).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should trigger validation on blur when pattern exists', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={mockOptionsData}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type an invalid value
    await user.type(input, 'invalid@name');

    // Validation should not appear until blur
    expect(
      screen.queryByText('Name must contain only letters, numbers, underscores, and hyphens')
    ).not.toBeInTheDocument();

    // Blur to trigger validation
    await user.tab();

    // Wait for validation error
    await waitFor(() => {
      expect(
        screen.getByText('Name must contain only letters, numbers, underscores, and hyphens')
      ).toBeInTheDocument();
    });
  });

  it('should apply validation from both OPTIONS pattern and custom validate prop', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const customValidate = vi.fn((value: string) => {
      if (value === 'reserved') {
        return 'This name is reserved';
      }
      return true;
    });

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={mockOptionsData}>
        <PageFormTextInput name="name" label="Name" validate={customValidate} />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Test OPTIONS pattern validation (should fire first)
    await user.type(input, 'invalid@name');
    await user.tab();

    await waitFor(() => {
      expect(
        screen.getByText('Name must contain only letters, numbers, underscores, and hyphens')
      ).toBeInTheDocument();
    });

    // Clear and test custom validation
    await user.clear(input);
    await user.type(input, 'reserved');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText('This name is reserved')).toBeInTheDocument();
    });
  });

  it('should pass validation when value matches the pattern', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={mockOptionsData}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type a valid value
    await user.type(input, 'valid-name_123');
    await user.tab();

    // Wait to ensure no validation error appears
    await waitFor(
      () => {
        expect(screen.queryByText(/must contain only/)).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should check both POST and PUT actions for patterns', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const optionsWithPUT = {
      actions: {
        PUT: {
          name: {
            pattern: '^[a-zA-Z0-9]+$',
            pattern_description: 'Name must contain only letters and numbers',
          },
        },
      },
    };

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={optionsWithPUT}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type an invalid value (contains hyphen)
    await user.type(input, 'invalid-name');
    await user.tab();

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText('Name must contain only letters and numbers')).toBeInTheDocument();
    });
  });

  it('should check PATCH action for patterns', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const optionsWithPATCH = {
      actions: {
        PATCH: {
          name: {
            pattern: '^[A-Z]+$',
            pattern_description: 'Name must contain only uppercase letters',
          },
        },
      },
    };

    render(
      <PageForm onSubmit={onSubmit} defaultValue={{ name: '' }} optionsData={optionsWithPATCH}>
        <PageFormTextInput name="name" label="Name" />
      </PageForm>
    );

    const input = screen.getByLabelText('Name');

    // Type an invalid value (contains lowercase)
    await user.type(input, 'Invalid');
    await user.tab();

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText('Name must contain only uppercase letters')).toBeInTheDocument();
    });
  });
});
