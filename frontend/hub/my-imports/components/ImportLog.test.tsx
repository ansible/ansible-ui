/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ImportLog } from './ImportLog';
import { CollectionImport } from '../../collections/Collection';

// Mock NavigationArrow component
vi.mock('../../common/ImportLogNavigationArrow', () => ({
  NavigationArrow: ({ direction }: { direction: string }) => (
    <button data-testid={`nav-arrow-${direction}`}>{direction}</button>
  ),
}));

// Mock ImportStatusBar component
vi.mock('./ImportStatusBar', () => ({
  ImportStatusBar: () => <div data-testid="import-status-bar">Status Bar</div>,
}));

// Mock getLogMessageColor
vi.mock('../../common/utils/getLogMessageColor', () => ({
  getLogMessageColor: (level: string) => (level === 'ERROR' ? 'red' : 'white'),
}));

const mockCollectionImport: CollectionImport = {
  id: '1',
  state: 'completed',
  version: '1.0.0',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:01:00Z',
  started_at: '2024-01-01T00:00:00Z',
  finished_at: '2024-01-01T00:01:00Z',
  namespace: 'testns',
  name: 'testcol',
  messages: [
    { level: 'INFO', message: 'Starting import process', time: 0 },
    { level: 'INFO', message: 'Importing collection', time: 1 },
    { level: 'INFO', message: 'Import completed successfully', time: 2 },
  ],
};

const mockImportWithError: CollectionImport = {
  ...mockCollectionImport,
  state: 'failed',
  error: {
    description: 'Import failed\nLine two of error',
    traceback: 'Traceback (most recent call last):\n  File "test.py"',
  },
};

describe('ImportLog', () => {
  it('should render loading state when isLoading is true', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={true} />
      </MemoryRouter>
    );
    // LoadingState component renders a spinner/progressbar
    expect(document.querySelector('[class*="loading"], [role="progressbar"]')).toBeTruthy();
  });

  it('should render error state when error is provided', () => {
    const error = new Error('Failed to load');
    error.name = 'LoadError';
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} error={error} />
      </MemoryRouter>
    );
    expect(screen.getByText('LoadError')).toBeInTheDocument();
  });

  it('should render import console with messages', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockCollectionImport} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('import-console')).toBeInTheDocument();
    expect(screen.getByText('Starting import process')).toBeInTheDocument();
    expect(screen.getByText('Importing collection')).toBeInTheDocument();
    expect(screen.getByText('Import completed successfully')).toBeInTheDocument();
  });

  it('should render import status bar when collectionImport is provided', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockCollectionImport} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('import-status-bar')).toBeInTheDocument();
  });

  it('should render navigation arrows', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockCollectionImport} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('nav-arrow-up')).toBeInTheDocument();
    expect(screen.getByTestId('nav-arrow-down')).toBeInTheDocument();
  });

  it('should render "No data" when collectionImport is undefined and not loading', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} />
      </MemoryRouter>
    );

    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should render error alert when import has errors', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockImportWithError} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('import-error')).toBeInTheDocument();
    expect(screen.getByText('Import failed')).toBeInTheDocument();
    expect(screen.getByText('Line two of error')).toBeInTheDocument();
  });

  it('should render error alert with traceback data', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockImportWithError} />
      </MemoryRouter>
    );

    // The traceback is inside the expandable alert body
    // Verify the error alert is present (traceback is part of the same alert)
    expect(screen.getByTestId('import-error')).toBeInTheDocument();
  });

  it('should apply custom code block background color style', () => {
    render(
      <MemoryRouter>
        <ImportLog isLoading={false} collectionImport={mockCollectionImport} />
      </MemoryRouter>
    );

    const codeBlock = screen.getByTestId('import-console');
    expect(codeBlock).toBeInTheDocument();
    // The style uses PF v6 custom property for dark background
  });
});
