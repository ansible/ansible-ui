import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Legend } from './Legend';

describe('Legend', () => {
  it('should list mesh node types and statuses', () => {
    render(<Legend />);

    expect(screen.getByTestId('mesh-viz-legend')).toBeInTheDocument();
    expect(screen.getByText('Node types')).toBeInTheDocument();
    expect(screen.getByText('Control')).toBeInTheDocument();
    expect(screen.getByText('Node status')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Hybrid')).toBeInTheDocument();
    expect(screen.getByText('Hop')).toBeInTheDocument();
    expect(screen.getByText('Provisioning')).toBeInTheDocument();
    expect(screen.getByText('Deprovisioning')).toBeInTheDocument();
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Link status')).toBeInTheDocument();
    expect(screen.getByText('Established')).toBeInTheDocument();
    expect(screen.getByText('Adding')).toBeInTheDocument();
    expect(screen.getByText('Removing')).toBeInTheDocument();
  });
});
