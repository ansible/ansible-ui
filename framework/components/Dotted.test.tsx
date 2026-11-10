/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Dotted } from './Dotted';

describe('Dotted', () => {
  it('renders children with dotted underline styling', () => {
    render(<Dotted>Hint text</Dotted>);
    expect(screen.getByText('Hint text')).toBeInTheDocument();
  });
});
