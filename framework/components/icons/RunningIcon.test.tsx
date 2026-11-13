import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RunningIcon } from './RunningIcon';

describe('RunningIcon', () => {
  it('renders the icon svg', () => {
    const { container } = render(<RunningIcon />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
