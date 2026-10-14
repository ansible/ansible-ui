/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ImportStatusIndicator } from './ImportStatusIndicator';

describe('ImportStatusIndicator', () => {
  it('renders placeholder for unknown status', () => {
    render(<ImportStatusIndicator />);
    expect(screen.getByText('---')).toBeInTheDocument();
  });

  it.each([
    ['waiting', 'Pending'],
    ['running', 'Running'],
    ['completed', 'Completed'],
    ['failed', 'Failed'],
    ['canceled', 'Canceled'],
    ['skipped', 'Canceled'],
  ])('renders label for status %s', (status, label) => {
    render(<ImportStatusIndicator status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
