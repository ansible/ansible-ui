/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Unavailable } from './Unavailable';

describe('Unavailable', () => {
  it('renders children with danger color styling', () => {
    render(<Unavailable>Host unreachable</Unavailable>);
    const span = screen.getByText('Host unreachable');
    expect(span.getAttribute('style')).toContain(
      'var(--pf-t--global--color--status--danger--default)'
    );
  });
});
