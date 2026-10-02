import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

import { NodeCodeEditorDetail } from './NodeCodeEditorDetail';

function renderWithRoute(
  props: { label?: string; nodeExtraVars: string; templateExtraVars: string },
  id = '42'
) {
  return render(
    <MemoryRouter initialEntries={[`/templates/${id}`]}>
      <Routes>
        <Route path="/templates/:id" element={<NodeCodeEditorDetail {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('NodeCodeEditorDetail', () => {
  it('should render the code block with node extra vars', () => {
    renderWithRoute({
      nodeExtraVars: 'my_var: hello',
      templateExtraVars: 'my_var: hello',
    });

    expect(screen.getByTestId('code-block-value')).toHaveTextContent('my_var: hello');
  });

  it('should use default label "Variables" when label prop is omitted', () => {
    renderWithRoute({
      nodeExtraVars: 'a: 1',
      templateExtraVars: 'a: 1',
    });

    expect(screen.getByText('Variables')).toBeInTheDocument();
  });

  it('should use custom label when provided', () => {
    renderWithRoute({
      label: 'Extra Variables',
      nodeExtraVars: 'x: 1',
      templateExtraVars: 'x: 1',
    });

    expect(screen.getByText('Extra Variables')).toBeInTheDocument();
  });

  it('should show override indicator when node vars differ from template', () => {
    renderWithRoute({
      nodeExtraVars: 'override: true',
      templateExtraVars: 'original: true',
    });

    expect(screen.getByRole('button', { name: 'Clipboard' })).toBeInTheDocument();
  });

  it('should not show override indicator when vars match template', () => {
    renderWithRoute({
      nodeExtraVars: 'same: value',
      templateExtraVars: 'same: value',
    });

    expect(screen.queryByRole('button', { name: 'Clipboard' })).not.toBeInTheDocument();
  });

  it('should render nothing when value is empty', () => {
    const { container } = renderWithRoute({
      nodeExtraVars: '',
      templateExtraVars: '',
    });

    expect(container.querySelector('[data-testid="code-block-value"]')).not.toBeInTheDocument();
  });

  it('should treat whitespace differences as matching', () => {
    renderWithRoute({
      nodeExtraVars: '  my_var: value  ',
      templateExtraVars: 'my_var: value',
    });

    expect(screen.queryByRole('button', { name: 'Clipboard' })).not.toBeInTheDocument();
  });
});
