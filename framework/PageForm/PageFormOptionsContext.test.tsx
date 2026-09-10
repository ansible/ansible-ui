import { render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMemo } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageForm } from './PageForm';
import { PageFormTextInput } from './Inputs/PageFormTextInput';
import {
  extractPageFormOptionsFields,
  PageFormFieldMetadataProvider,
  PageFormOptionsContext,
  PageFormOptionsProvider,
  usePageFormOptionsContext,
  usePageFormOptionsFields,
} from './PageFormOptionsContext';

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

describe('extractPageFormOptionsFields', () => {
  it('returns an empty map when optionsData is undefined', () => {
    expect(extractPageFormOptionsFields(undefined)).toEqual({});
  });

  it('returns an empty map when optionsData has no actions', () => {
    expect(extractPageFormOptionsFields({})).toEqual({});
  });

  it('extracts pattern and pattern_description from POST actions', () => {
    const fields = extractPageFormOptionsFields({
      actions: { POST: { name: { pattern: '^[a-z]+$', pattern_description: 'lowercase only' } } },
    });
    expect(fields).toEqual({
      name: { pattern: '^[a-z]+$', pattern_description: 'lowercase only', flags: undefined },
    });
  });

  it('supports camelCase patternDescription', () => {
    const fields = extractPageFormOptionsFields({
      actions: { POST: { name: { pattern: '^[a-z]+$', patternDescription: 'lowercase only' } } },
    });
    expect(fields.name?.pattern_description).toBe('lowercase only');
  });

  it('prefers snake_case pattern_description over camelCase when both are present', () => {
    const fields = extractPageFormOptionsFields({
      actions: {
        POST: {
          name: { pattern: '^[a-z]+$', pattern_description: 'snake', patternDescription: 'camel' },
        },
      },
    });
    expect(fields.name?.pattern_description).toBe('snake');
  });

  it('includes flags when present', () => {
    const fields = extractPageFormOptionsFields({
      actions: { POST: { name: { pattern: String.raw`^\p{L}+$`, flags: 'u' } } },
    });
    expect(fields.name?.flags).toBe('u');
  });

  it('skips fields with no pattern or pattern_description', () => {
    const fields = extractPageFormOptionsFields({
      actions: { POST: { description: { type: 'string' } as { pattern?: string } } },
    });
    expect(fields).toEqual({});
  });

  it('checks PUT and PATCH actions in addition to POST', () => {
    const fields = extractPageFormOptionsFields({
      actions: {
        PUT: { name: { pattern: '^put$' } },
        PATCH: { description: { pattern: '^patch$' } },
      },
    });
    expect(fields.name?.pattern).toBe('^put$');
    expect(fields.description?.pattern).toBe('^patch$');
  });
});

describe('usePageFormOptionsFields', () => {
  it('returns the same object reference across re-renders with the same optionsData', () => {
    const optionsData = { actions: { POST: { name: { pattern: '^[a-z]+$' } } } };
    const { result, rerender } = renderHook(({ data }) => usePageFormOptionsFields(data), {
      initialProps: { data: optionsData },
    });
    const first = result.current;
    rerender({ data: optionsData });
    expect(result.current).toBe(first);
  });

  it('recomputes when optionsData changes', () => {
    const { result, rerender } = renderHook(({ data }) => usePageFormOptionsFields(data), {
      initialProps: { data: { actions: { POST: { name: { pattern: '^a$' } } } } },
    });
    expect(result.current.name?.pattern).toBe('^a$');
    rerender({ data: { actions: { POST: { name: { pattern: '^b$' } } } } });
    expect(result.current.name?.pattern).toBe('^b$');
  });
});

function createWrapper(fields: Record<string, { pattern?: string }>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    const value = useMemo(() => ({ fields }), []);
    return (
      <PageFormOptionsContext.Provider value={value}>{children}</PageFormOptionsContext.Provider>
    );
  };
}

describe('usePageFormOptionsContext', () => {
  it('looks up a bare (non-dotted) field name directly', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('name'), {
      wrapper: createWrapper({ name: { pattern: '^a$' } }),
    });
    expect(result.current?.pattern).toBe('^a$');
  });

  it('defaults to the last dot-separated segment for nested field names', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('organization.name'), {
      wrapper: createWrapper({ name: { pattern: '^a$' } }),
    });
    expect(result.current?.pattern).toBe('^a$');
  });

  it('handles multiple levels of nesting by using only the last segment', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('prompt.rules.0.name'), {
      wrapper: createWrapper({ name: { pattern: '^a$' } }),
    });
    expect(result.current?.pattern).toBe('^a$');
  });

  it('uses optionsFieldName to override the default lookup', () => {
    const { result } = renderHook(
      () => usePageFormOptionsContext('organization.name', 'other_name'),
      { wrapper: createWrapper({ other_name: { pattern: '^a$' } }) }
    );
    expect(result.current?.pattern).toBe('^a$');
  });

  it('returns undefined when no metadata matches the lookup key', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('unknown'), {
      wrapper: createWrapper({ name: { pattern: '^a$' } }),
    });
    expect(result.current).toBeUndefined();
  });
});

describe('PageFormFieldMetadataProvider', () => {
  it('provides fields to descendants', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('name'), {
      wrapper: ({ children }) => (
        <PageFormFieldMetadataProvider fields={{ name: { pattern: '^a$' } }}>
          {children}
        </PageFormFieldMetadataProvider>
      ),
    });
    expect(result.current?.pattern).toBe('^a$');
  });

  it('replaces the ambient context by default (merge omitted)', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('outer'), {
      wrapper: ({ children }) => (
        <PageFormOptionsContext.Provider value={{ fields: { outer: { pattern: '^outer$' } } }}>
          <PageFormFieldMetadataProvider fields={{ inner: { pattern: '^inner$' } }}>
            {children}
          </PageFormFieldMetadataProvider>
        </PageFormOptionsContext.Provider>
      ),
    });
    // "outer" was not carried over since merge wasn't requested
    expect(result.current).toBeUndefined();
  });

  it('merges with the ambient context when merge is true', () => {
    const { result } = renderHook(
      () => ({
        outer: usePageFormOptionsContext('outer'),
        inner: usePageFormOptionsContext('inner'),
      }),
      {
        wrapper: ({ children }) => (
          <PageFormOptionsContext.Provider value={{ fields: { outer: { pattern: '^outer$' } } }}>
            <PageFormFieldMetadataProvider fields={{ inner: { pattern: '^inner$' } }} merge>
              {children}
            </PageFormFieldMetadataProvider>
          </PageFormOptionsContext.Provider>
        ),
      }
    );
    expect(result.current.outer?.pattern).toBe('^outer$');
    expect(result.current.inner?.pattern).toBe('^inner$');
  });

  it('own fields win over the ambient context on name collisions when merging', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('name'), {
      wrapper: ({ children }) => (
        <PageFormOptionsContext.Provider value={{ fields: { name: { pattern: '^outer$' } } }}>
          <PageFormFieldMetadataProvider fields={{ name: { pattern: '^inner$' } }} merge>
            {children}
          </PageFormFieldMetadataProvider>
        </PageFormOptionsContext.Provider>
      ),
    });
    expect(result.current?.pattern).toBe('^inner$');
  });
});

describe('PageFormOptionsProvider', () => {
  it('extracts and provides fields from a raw OPTIONS response', () => {
    const { result } = renderHook(() => usePageFormOptionsContext('name'), {
      wrapper: ({ children }) => (
        <PageFormOptionsProvider optionsData={{ actions: { POST: { name: { pattern: '^a$' } } } }}>
          {children}
        </PageFormOptionsProvider>
      ),
    });
    expect(result.current?.pattern).toBe('^a$');
  });

  it('merges with the ambient context when merge is true', () => {
    const { result } = renderHook(
      () => ({
        outer: usePageFormOptionsContext('outer'),
        maxHosts: usePageFormOptionsContext('maxHosts'),
      }),
      {
        wrapper: ({ children }) => (
          <PageFormOptionsContext.Provider value={{ fields: { outer: { pattern: '^outer$' } } }}>
            <PageFormOptionsProvider
              optionsData={{ actions: { POST: { maxHosts: { pattern: '^[0-9]+$' } } } }}
              merge
            >
              {children}
            </PageFormOptionsProvider>
          </PageFormOptionsContext.Provider>
        ),
      }
    );
    expect(result.current.outer?.pattern).toBe('^outer$');
    expect(result.current.maxHosts?.pattern).toBe('^[0-9]+$');
  });

  it('renders children even when optionsData is undefined', () => {
    render(
      <PageFormOptionsProvider>
        <div>child content</div>
      </PageFormOptionsProvider>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
