import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { UIFlagsPage } from './UIFlagsPage';

vi.mock('./useUIFlagColumns', () => ({
  useUIFlagColumns: () => [],
}));

vi.mock('./useUIFlagRowActions', () => ({
  useUIFlagRowActions: () => [],
}));

vi.mock('@ansible/ansible-ui-framework', () => ({
  PageHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
  PageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PageTable: () => <div data-testid="ui-flags-table" />,
  useInMemoryView: () => ({
    pageItems: [],
    itemCount: 0,
    keyFn: () => '',
    page: 1,
    perPage: 10,
    setPage: vi.fn(),
    setPerPage: vi.fn(),
  }),
}));

describe('UIFlagsPage', () => {
  test('should render the UI flags page header', () => {
    render(<UIFlagsPage />);

    expect(screen.getByText('User Interface Flags')).toBeInTheDocument();
    expect(screen.getByTestId('ui-flags-table')).toBeInTheDocument();
  });
});
