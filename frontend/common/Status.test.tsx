import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { StatusCell, StatusLabel } from './Status';

describe('StatusLabel', () => {
  it('should render known status label and data-cy attribute', () => {
    render(<StatusLabel status="running" dataCy="status-running" />);
    expect(screen.getByTestId('status-running')).toHaveTextContent('Running');
  });

  it('should use default status key when status is omitted', () => {
    render(<StatusLabel status={undefined} dataCy="status-unknown" />);
    expect(screen.getByTestId('status-unknown')).toHaveTextContent('default');
  });

  it.each([
    'approved',
    'failed',
    'pending',
    'canceled',
    'stopped',
    'deprovisioning',
    'unresponsive',
    'custom-status-value',
  ])('should render status %s without error', (status) => {
    render(<StatusLabel status={status} dataCy={`status-${status}`} />);
    expect(screen.getByTestId(`status-${status}`)).toBeInTheDocument();
  });
});

describe('StatusCell', () => {
  it('should render status text in table cell', () => {
    render(
      <MemoryRouter>
        <StatusCell status="success" />
      </MemoryRouter>
    );
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('should hide label text when hideLabel is true', () => {
    render(
      <MemoryRouter>
        <StatusCell status="success" hideLabel />
      </MemoryRouter>
    );
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
  });
});
