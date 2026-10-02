import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@patternfly/react-topology', () => ({
  observer: (component: unknown) => component,
  useVisualizationController: vi.fn(),
  NodeStatus: { danger: 'danger', success: 'success', info: 'info' },
}));

import { NodeTagDetail } from './NodeTagDetail';

describe('NodeTagDetail', () => {
  it('should render node tags when nodeTags are provided', () => {
    render(
      <NodeTagDetail
        label="Job tags"
        nodeTags={[{ name: 'deploy' }, { name: 'build' }]}
        templateTags={[{ name: 'deploy' }, { name: 'build' }]}
      />
    );

    expect(screen.getByText('deploy')).toBeInTheDocument();
    expect(screen.getByText('build')).toBeInTheDocument();
  });

  it('should render template tags when nodeTags are empty', () => {
    render(
      <NodeTagDetail
        label="Skip tags"
        nodeTags={[]}
        templateTags={[{ name: 'skip1' }, { name: 'skip2' }]}
      />
    );

    expect(screen.getByText('skip1')).toBeInTheDocument();
    expect(screen.getByText('skip2')).toBeInTheDocument();
  });

  it('should render nothing when both nodeTags and templateTags are empty', () => {
    const { container } = render(<NodeTagDetail label="Tags" nodeTags={[]} templateTags={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('should show override indicator when tags differ from template', () => {
    render(
      <NodeTagDetail
        label="Job tags"
        nodeTags={[{ name: 'custom-tag' }]}
        templateTags={[{ name: 'original-tag' }]}
      />
    );

    expect(screen.getByText('custom-tag')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clipboard' })).toBeInTheDocument();
  });

  it('should not show override indicator when tags match template', () => {
    render(
      <NodeTagDetail
        label="Job tags"
        nodeTags={[{ name: 'tag1' }]}
        templateTags={[{ name: 'tag1' }]}
      />
    );

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clipboard' })).not.toBeInTheDocument();
  });

  it('should detect mismatch when arrays have different lengths', () => {
    render(
      <NodeTagDetail
        label="Tags"
        nodeTags={[{ name: 'a' }, { name: 'b' }]}
        templateTags={[{ name: 'a' }]}
      />
    );

    expect(screen.getByRole('button', { name: 'Clipboard' })).toBeInTheDocument();
  });

  it('should detect mismatch when arrays have same length but different items', () => {
    render(
      <NodeTagDetail label="Tags" nodeTags={[{ name: 'x' }]} templateTags={[{ name: 'y' }]} />
    );

    expect(screen.getByRole('button', { name: 'Clipboard' })).toBeInTheDocument();
  });
});
