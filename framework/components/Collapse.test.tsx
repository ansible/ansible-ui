/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Collapse } from './Collapse';

describe('Collapse', () => {
  it('applies expanded class when open', () => {
    const { container } = render(
      <Collapse open>
        <span>Visible</span>
      </Collapse>
    );
    expect(container.firstChild).toHaveClass('collapsed', 'expanded');
    expect(screen.getByText('Visible')).toBeInTheDocument();
  });

  it('omits expanded class when closed', () => {
    const { container } = render(
      <Collapse open={false}>
        <span>Hidden</span>
      </Collapse>
    );
    expect(container.firstChild).toHaveClass('collapsed');
    expect(container.firstChild).not.toHaveClass('expanded');
  });
});
