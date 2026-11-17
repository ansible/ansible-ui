import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MeshEdge } from './MeshEdge';

vi.mock('@patternfly/react-topology', () => ({
  DefaultEdge: ({ element }: { element: unknown }) => (
    <p data-testid="default-edge">{String(element)}</p>
  ),
}));

describe('MeshEdge', () => {
  it('renders DefaultEdge with element data', () => {
    const element = {
      getData: () => ({ label: 'peer-link' }),
    };

    const { getByTestId } = render(<MeshEdge element={element as never} />);

    expect(getByTestId('default-edge')).toBeInTheDocument();
  });
});
