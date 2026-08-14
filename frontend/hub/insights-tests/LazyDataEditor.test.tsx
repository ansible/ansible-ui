/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataEditor } from '../insights/LazyDataEditor';

vi.mock('../../../framework/components/DataEditor', () => ({
  DataEditor: (props: Record<string, unknown>) => (
    <div data-testid="data-editor" data-language={props.language} data-name={props.name}>
      Mock DataEditor
    </div>
  ),
}));

describe('LazyDataEditor', () => {
  it('should render the DataEditor after lazy load', async () => {
    render(
      <DataEditor
        name="test-editor"
        language="json"
        value="{}"
        onChange={vi.fn()}
        setError={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('data-editor')).toBeInTheDocument();
    });
  });

  it('should pass props through to the lazy-loaded DataEditor', async () => {
    render(
      <DataEditor
        name="yaml-editor"
        language="yaml"
        value="key: value"
        onChange={vi.fn()}
        setError={vi.fn()}
      />
    );

    await waitFor(() => {
      const editor = screen.getByTestId('data-editor');
      expect(editor).toHaveAttribute('data-language', 'yaml');
      expect(editor).toHaveAttribute('data-name', 'yaml-editor');
    });
  });

  it('should render editor content after loading', async () => {
    render(
      <DataEditor
        name="md-editor"
        language="markdown"
        value="# Hello"
        onChange={vi.fn()}
        setError={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Mock DataEditor')).toBeInTheDocument();
    });
  });
});
