/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageLoadingTable } from './PageLoadingTable';

describe('PageLoadingTable', () => {
  it('should render default 10 skeleton rows', () => {
    render(<PageLoadingTable />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(10);
  });

  it('should render custom row count via rows prop', () => {
    render(<PageLoadingTable rows={5} />);
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5);
  });
});
