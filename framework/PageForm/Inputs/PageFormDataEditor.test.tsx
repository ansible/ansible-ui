/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useForm, FormProvider } from 'react-hook-form';
import * as yamlSchema from '../../utils/yamlSchema';
import { PageFormDataEditor, valueToObject, objectToString } from './PageFormDataEditor';

beforeEach(() => {
  vi.mock('@ansible/ansible-ui-framework/components/DataEditor', () => {
    const FakeDataEditor = vi.fn((props: Record<string, string | ((value: string) => void)>) => (
      <textarea
        id={props.id as string}
        name={props.id as string}
        value={props.value as string}
        onChange={(e) => {
          const onChange = props.onChange as (value: string) => void;
          onChange(e.target.value);
        }}
        className={props.className as string}
        onFocus={props.onFocus as () => void}
        onBlur={props.onBlur as () => void}
        data-testid="data-editor"
      />
    ));
    return { DataEditor: FakeDataEditor };
  });
});

interface ExtraVars {
  vars: string;
}

interface WithObject {
  data: object;
}

describe('PageFormDataEditor utility functions', () => {
  describe('valueToObject', () => {
    test('should preserve YAML with comments', () => {
      const yamlWithComments = `# This is a comment
variable1: value1
# Another comment
variable2: value2  # inline comment`;

      const result = valueToObject(yamlWithComments);
      expect(result).toHaveProperty('__preserveYamlString', yamlWithComments);
    });

    test('should parse regular YAML without comments', () => {
      const yamlWithoutComments = `variable1: value1
variable2: value2`;

      const result = valueToObject(yamlWithoutComments);
      expect(result).toEqual({ variable1: 'value1', variable2: 'value2' });
    });

    test('should handle JSON strings', () => {
      const jsonString = '{"abc": 123}';
      const result = valueToObject(jsonString);
      expect(result).toEqual({ abc: 123 });
    });

    test('should handle empty values', () => {
      expect(valueToObject(null)).toEqual({});
      expect(valueToObject(undefined)).toEqual({});
      expect(valueToObject('')).toBeUndefined();
    });

    // Regression tests for AAP-93178: YAML/JSON parsing broken with unusual inputs.
    // When both JSON and YAML parsing fail, valueToObject must throw rather than
    // returning the raw string. Returning the raw string causes jsyaml.dump() to
    // serialise it as a YAML block scalar that grows unboundedly on every
    // parse→dump round-trip, eating memory until the browser tab crashes.
    describe('invalid input does not cause growing content loop (AAP-93178)', () => {
      test('throws for indented YAML document separator (leading spaces before ---)', () => {
        // "  ---\n  a: b" — a common pattern when copy-pasting from code blocks.
        // jsyaml rejects this because `---` is only a document separator at column 0.
        expect(() => valueToObject('  ---\n  a: b')).toThrow();
        expect(() => valueToObject(' ---\n a: b')).toThrow();
      });

      test('throws for unclosed single-quoted scalar in JSON mode', () => {
        // " '\n" — a single quote with a leading space is invalid in both JSON and YAML.
        expect(() => valueToObject(" '\n")).toThrow();
      });

      test('round-trip of invalid input does not grow unboundedly', () => {
        // Verify that the transform loop that caused the crash no longer runs.
        // Previously: valueToObject returned the raw string → objectToString called
        // jsyaml.dump(string) → block scalar serialisation → each load+dump cycle
        // added 2 more spaces → unbounded growth → browser crash.
        const invalidInput = '  ---\n  a: b';
        // valueToObject must throw for this input, preventing the loop entirely.
        expect(() => valueToObject(invalidInput)).toThrow();
      });

      test('throws for whitespace-only strings that YAML loads as undefined', () => {
        // Typing a lone space in JSON mode must not be treated as "empty" and wipe saved vars.
        expect(() => valueToObject(' ')).toThrow();
        expect(() => valueToObject('  ')).toThrow();
      });

      test('throws a generic message when YAML loader throws a non-Error value', () => {
        vi.spyOn(yamlSchema, 'safeLoad').mockImplementation(() => {
          // Plain object — not instanceof Error; exercises the generic fallback in valueToObject.
          throw { reason: 'mock-yaml-load-failure' };
        });

        expect(() => valueToObject('not-json')).toThrow('Failed to parse value as JSON or YAML');

        vi.restoreAllMocks();
      });
    });
  });

  describe('objectToString', () => {
    test('should preserve YAML comments when converting back', () => {
      const yamlWithComments = `# This is a comment
variable1: value1
# Another comment
variable2: value2  # inline comment`;

      const preservedObj = { __preserveYamlString: yamlWithComments };
      const result = objectToString(preservedObj, 'yaml');
      expect(result).toBe(yamlWithComments);
    });

    test('should convert regular objects to YAML', () => {
      const obj = { variable1: 'value1', variable2: 'value2' };
      const result = objectToString(obj, 'yaml');
      expect(result).toContain('variable1: value1');
      expect(result).toContain('variable2: value2');
    });

    test('should convert objects to JSON', () => {
      const obj = { abc: 123 };
      const result = objectToString(obj, 'json');
      expect(result).toBe(JSON.stringify(obj, null, 2));
    });

    test('should handle empty objects', () => {
      expect(objectToString({}, 'yaml')).toBe('');
      expect(objectToString([], 'yaml')).toBe('');
    });
  });
});

describe('PageFormDataEditor Component', () => {
  // Wrapper component for testing
  function TestWrapper<T extends Record<string, unknown>>({
    defaultValue,
    onSubmit,
    children,
  }: Readonly<{
    defaultValue: T;
    onSubmit: (data: T) => void;
    children: React.ReactNode;
  }>) {
    const methods = useForm({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      defaultValues: defaultValue as Record<string, unknown>,
    });

    return (
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            void methods.handleSubmit(onSubmit as (data: Record<string, unknown>) => void)(e);
          }}
        >
          {children}
          <button type="submit">Submit</button>
        </form>
      </FormProvider>
    );
  }

  test('should handle YAML string format', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: 'abc: 123' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Editor" name="vars" format="yaml" />
      </TestWrapper>
    );

    const textarea = screen.getByTestId('data-editor');
    expect(textarea).toHaveDisplayValue('abc: 123');

    const jsonButton = screen.getByRole('button', { name: /json/i });
    await user.click(jsonButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/.*"abc": 123.*/)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ vars: 'abc: 123' }, expect.any(Object));
    });
  });

  test('should handle JSON string format', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: '{ "abc": 123 }' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Editor" name="vars" format="json" />
      </TestWrapper>
    );

    const yamlButton = screen.getByRole('button', { name: /yaml/i });
    await user.click(yamlButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/.*abc: 123.*/)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        {
          vars: '{ "abc": 123 }',
        },
        expect.any(Object)
      );
    });
  });

  test('should handle object data format', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ data: { def: 456 } }} onSubmit={onSubmit}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue(/.*def: 456.*/)).toBeInTheDocument();

    const jsonButton = screen.getByRole('button', { name: /json/i });
    await user.click(jsonButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/.*"def": 456.*/)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ data: { def: 456 } }, expect.any(Object));
    });
  });

  test('should preserve YAML comments when using format="yaml"', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const yamlWithComments = `# This is a comment
variable1: value1
# Another comment
variable2: value2  # inline comment`;

    render(
      <TestWrapper defaultValue={{ vars: yamlWithComments }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Editor" name="vars" format="yaml" />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue(/.*# This is a comment.*/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/.*# Another comment.*/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/.*# inline comment.*/)).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ vars: yamlWithComments }, expect.any(Object));
    });
  });

  test('should display file upload content with comments preserved', async () => {
    const user = userEvent.setup();
    const yamlContentWithComments = `# Configuration file
variable1: value1  # First variable
# Second section
variable2: value2`;

    render(
      <TestWrapper defaultValue={{ data: {} }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    const file = new File([yamlContentWithComments], 'test.yaml', { type: 'text/yaml' });
    const fileInput = document.querySelector('#code-editor-dropzone-input') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByDisplayValue(/.*# Configuration file.*/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/.*# First variable.*/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/.*# Second section.*/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/.*variable1: value1.*/)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/.*variable2: value2.*/)).toBeInTheDocument();
    });
  });

  test('should preserve YAML comments through complete form processing and format switching flow', () => {
    // This comprehensive test validates that YAML comments are preserved throughout the entire flow
    // Tests: form processing, format switching, and regression prevention

    const jobTemplateExtraVars = `# Extra variables for this job template
ansible_host: localhost  # Target host
ansible_user: admin      # SSH user
debug_mode: true         # Enable debugging`;

    // Test 1: Core form processing flow (prevents comment loss during save)
    const processedForForm = valueToObject(jobTemplateExtraVars, false);
    expect(processedForForm).toEqual({
      __preserveYamlString: jobTemplateExtraVars,
    });

    // Test 2: Form submission preserves comments
    const submittedValue = objectToString(processedForForm, 'yaml');
    expect(submittedValue).toBe(jobTemplateExtraVars);
    expect(submittedValue).toContain('# Extra variables for this job template');
    expect(submittedValue).toContain('# Target host');

    // Test 3: Format switching to JSON shows clean JSON (comments stripped)
    const jsonRepresentation = objectToString(processedForForm, 'json');
    expect(jsonRepresentation).toBe(
      '{\n  "ansible_host": "localhost",\n  "ansible_user": "admin",\n  "debug_mode": true\n}'
    );
    expect(jsonRepresentation).not.toContain('# Extra variables');
    expect(jsonRepresentation).not.toContain('# Target host');

    // Test 4: Format switching back to YAML restores comments
    const backToYaml = objectToString(processedForForm, 'yaml');
    expect(backToYaml).toBe(jobTemplateExtraVars);
    expect(backToYaml).toContain('# Extra variables for this job template');
    expect(backToYaml).toContain('# Enable debugging');
  });

  test('should show copy button by default', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /copy to clipboard/i })).toBeInTheDocument();
  });

  test('should hide copy button when disableCopy is true', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" disableCopy />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /copy to clipboard/i })).not.toBeInTheDocument();
  });

  test('should show upload button by default', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /upload from file/i })).toBeInTheDocument();
  });

  test('should hide upload button when disableUpload is true', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" disableUpload />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /upload from file/i })).not.toBeInTheDocument();
  });

  test('should show download button by default', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /download file/i })).toBeInTheDocument();
  });

  test('should hide download button when disableDownload is true', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject>
          label="Editor"
          name="data"
          format="object"
          disableDownload
        />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: /download file/i })).not.toBeInTheDocument();
  });

  test('should start collapsed when defaultCollapsed is true', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject>
          label="Editor"
          name="data"
          format="object"
          defaultCollapsed
        />
      </TestWrapper>
    );

    expect(screen.queryByTestId('data-editor')).not.toBeInTheDocument();
  });

  test('should start expanded when defaultCollapsed is not set', () => {
    render(
      <TestWrapper defaultValue={{ data: { test: 1 } }} onSubmit={vi.fn()}>
        <PageFormDataEditor<WithObject> label="Editor" name="data" format="object" />
      </TestWrapper>
    );

    expect(screen.getByTestId('data-editor')).toBeInTheDocument();
  });

  // Regression test for AAP-93178.
  //
  // The DataEditor mock renders a controlled textarea (value={props.value}).
  // When handleChange() throws on an invalid YAML string, the form value does
  // not update, so the textarea resets to its previous value after every
  // re-render.  This prevents userEvent.type from accumulating multi-character
  // text, making fireEvent.change the only reliable way to fire the onChange
  // callback with the full invalid string in one shot.
  test('should display an inline parse error when invalid YAML is entered (AAP-93178)', async () => {
    render(
      <TestWrapper defaultValue={{ vars: '' }} onSubmit={vi.fn()}>
        <PageFormDataEditor<ExtraVars> label="Extra variables" name="vars" format="yaml" />
      </TestWrapper>
    );

    // Simulate entering leading-space YAML — a common copy-paste artifact.
    // With the fix, valueToObject() throws so handleChange() calls setError()
    // instead of normalising the raw string through jsyaml.dump(), which
    // previously caused a growing block-scalar loop that crashed the browser.
    fireEvent.change(screen.getByTestId('data-editor'), {
      target: { value: '  ---\n  a: b' },
    });

    // The js-yaml parse error must appear in the field's helper text.
    await waitFor(() => {
      expect(
        screen.getByText(/end of the stream or a document separator is expected/i)
      ).toBeInTheDocument();
    });
  });

  test('should not clear saved extra vars when user enters whitespace then invalid JSON (AAP-93178)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: 'foo: bar' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Extra variables" name="vars" format="yaml" />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: /json/i }));

    fireEvent.change(screen.getByTestId('data-editor'), { target: { value: ' ' } });
    fireEvent.change(screen.getByTestId('data-editor'), { target: { value: " '" } });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should block form submission when editor holds invalid YAML (AAP-93178)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: '' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Extra variables" name="vars" format="yaml" />
      </TestWrapper>
    );

    // Enter invalid YAML so the parseFormat validate rule is armed.
    fireEvent.change(screen.getByTestId('data-editor'), {
      target: { value: '  ---\n  a: b' },
    });

    // Confirm the error helper text is visible.
    await waitFor(() => {
      expect(
        screen.getByText(/end of the stream or a document separator is expected/i)
      ).toBeInTheDocument();
    });

    // Click the submit button — the form must NOT call onSubmit because the
    // parseFormat validate rule should block submission.
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // onSubmit must not have been called.
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should allow submit after invalid YAML is corrected to valid YAML (AAP-93178)', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: '' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars> label="Extra variables" name="vars" format="yaml" />
      </TestWrapper>
    );

    fireEvent.change(screen.getByTestId('data-editor'), {
      target: { value: '  ---\n  a: b' },
    });

    await waitFor(() => {
      expect(
        screen.getByText(/end of the stream or a document separator is expected/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('data-editor'), {
      target: { value: 'abc: 123' },
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/end of the stream or a document separator is expected/i)
      ).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ vars: 'abc: 123' }, expect.any(Object));
    });
  });

  test('should apply custom validate function together with parseFormat rule', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const customValidate = vi.fn(() => 'Custom validation failed');

    render(
      <TestWrapper defaultValue={{ vars: 'abc: 123' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars>
          label="Extra variables"
          name="vars"
          format="yaml"
          validate={customValidate}
        />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(customValidate).toHaveBeenCalled();
      expect(screen.getByText('Custom validation failed')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  test('should apply custom validate rules object together with parseFormat rule', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TestWrapper defaultValue={{ vars: 'abc: 123' }} onSubmit={onSubmit}>
        <PageFormDataEditor<ExtraVars>
          label="Extra variables"
          name="vars"
          format="yaml"
          validate={{
            rejectValue: () => 'Object rule validation failed',
          }}
        />
      </TestWrapper>
    );

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => {
      expect(screen.getByText('Object rule validation failed')).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
