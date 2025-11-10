/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { PageDetailCodeEditor } from './PageDetailCodeEditor';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-id' }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../PageSettings/PageSettingsProvider', () => ({
  usePageSettings: () => ({
    dataEditorFormat: 'yaml',
  }),
}));

vi.mock('../hooks/useClipboard', () => ({
  useClipboard: () => ({
    copySuccess: false,
    writeToClipboard: vi.fn(),
  }),
}));

vi.mock('../PageForm/Inputs/PageFormDataEditor', () => ({
  objectToString: (obj: unknown, language: string) => {
    if (language === 'json') {
      return JSON.stringify(obj, null, 2);
    }
    if (obj && typeof obj === 'object' && '__preserveYamlString' in obj) {
      return (obj as { __preserveYamlString: string }).__preserveYamlString;
    }
    if (obj && typeof obj === 'object') {
      return JSON.stringify(obj, null, 2);
    }
    return String(obj);
  },
  valueToObject: (value: string, isArray: boolean): unknown => {
    if (isArray) {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        return [];
      }
    }
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return { __preserveYamlString: value };
    }
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('PageDetailCodeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with default props', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" />
      </TestWrapper>
    );

    expect(screen.getByTestId('code-block-value')).toBeInTheDocument();
    const codeBlock = screen.getByTestId('code-block-value');
    expect(codeBlock.textContent).toContain('test: value');
  });

  test('should render with custom label', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" label="Custom Label" />
      </TestWrapper>
    );

    expect(screen.getByTestId('label-custom-label')).toBeInTheDocument();
    expect(screen.getByTestId('label-custom-label')).toHaveTextContent('Custom Label');
  });

  test('should render with help text', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" helpText="Help text content" />
      </TestWrapper>
    );

    expect(screen.getByTestId('code-block-value')).toBeInTheDocument();
  });

  test('should show copy to clipboard button by default', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Copy to clipboard' })).toBeInTheDocument();
  });

  test('should hide copy to clipboard button when showCopyToClipboard is false', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" showCopyToClipboard={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: 'Copy to clipboard' })).not.toBeInTheDocument();
  });

  test('should show language toggle by default', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: 'Toggle to YAML' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle to JSON' })).toBeInTheDocument();
  });

  test('should hide language toggle when toggleLanguage is false', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" toggleLanguage={false} />
      </TestWrapper>
    );

    expect(screen.queryByRole('button', { name: 'Toggle to YAML' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Toggle to JSON' })).not.toBeInTheDocument();
  });

  test('should toggle language from YAML to JSON', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PageDetailCodeEditor value='{"key": "value"}' />
      </TestWrapper>
    );

    const jsonButton = screen.getByRole('button', { name: 'Toggle to JSON' });
    await user.click(jsonButton);

    await waitFor(() => {
      const codeBlock = screen.getByTestId('code-block-value');
      expect(codeBlock).toBeInTheDocument();
    });
  });

  test('should toggle language from JSON to YAML', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PageDetailCodeEditor value='{"key": "value"}' />
      </TestWrapper>
    );

    const yamlButton = screen.getByRole('button', { name: 'Toggle to YAML' });
    await user.click(yamlButton);

    await waitFor(() => {
      const codeBlock = screen.getByTestId('code-block-value');
      expect(codeBlock).toBeInTheDocument();
    });
  });

  test('should handle empty value', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="" />
      </TestWrapper>
    );

    expect(screen.getByTestId('code-block-value')).toBeInTheDocument();
    const codeBlock = screen.getByTestId('code-block-value');
    expect(codeBlock.textContent).toBe('');
  });

  test('should handle isEmpty prop', () => {
    const { container } = render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" isEmpty />
      </TestWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  test('should handle isArray prop', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <PageDetailCodeEditor value='["item1", "item2"]' isArray />
      </TestWrapper>
    );

    const jsonButton = screen.getByRole('button', { name: 'Toggle to JSON' });
    await user.click(jsonButton);

    await waitFor(() => {
      const codeBlock = screen.getByTestId('code-block-value');
      expect(codeBlock).toBeInTheDocument();
    });
  });

  test('should handle fullWidth prop', () => {
    render(
      <TestWrapper>
        <PageDetailCodeEditor value="test: value" fullWidth={false} />
      </TestWrapper>
    );

    expect(screen.getByTestId('code-block-value')).toBeInTheDocument();
  });
});
