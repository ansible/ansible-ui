/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageLayoutWithUnauthorized } from './PageLayoutWithUnauthorized';

describe('PageLayoutWithUnauthorized', () => {
  const defaultProps = {
    isUnauthorized: false,
    resourceName: 'Test Resource',
    title: 'Test Page',
    description: 'Test description',
  };

  it('should render children when user is authorized', () => {
    render(
      <PageLayoutWithUnauthorized {...defaultProps}>
        <div data-testid="authorized-content">Authorized Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.getByTestId('authorized-content')).toBeInTheDocument();
    expect(screen.getByText('Authorized Content')).toBeInTheDocument();
    expect(screen.queryByText(/You do not have access/)).not.toBeInTheDocument();
  });

  it('should render unauthorized state when isUnauthorized is true', () => {
    render(
      <PageLayoutWithUnauthorized {...defaultProps} isUnauthorized={true}>
        <div data-testid="authorized-content">Authorized Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.queryByTestId('authorized-content')).not.toBeInTheDocument();
    expect(screen.getByText('You do not have access to Test Resource')).toBeInTheDocument();
    expect(
      screen.getByText('Contact your organization administrator for more information.')
    ).toBeInTheDocument();
  });

  it('should render page header with title', () => {
    render(
      <PageLayoutWithUnauthorized {...defaultProps}>
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('should render page header with description', () => {
    render(
      <PageLayoutWithUnauthorized {...defaultProps}>
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should use custom unauthorized title when provided', () => {
    render(
      <PageLayoutWithUnauthorized
        {...defaultProps}
        isUnauthorized={true}
        unauthorizedTitle="Custom access denied message"
      >
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.getByText('Custom access denied message')).toBeInTheDocument();
    expect(screen.queryByText(/You do not have access to/)).not.toBeInTheDocument();
  });

  it('should use custom admin message when provided', () => {
    render(
      <PageLayoutWithUnauthorized
        {...defaultProps}
        isUnauthorized={true}
        unauthorizedAdminMessage="Please contact support for help."
      >
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    expect(screen.getByText('Please contact support for help.')).toBeInTheDocument();
    expect(
      screen.queryByText('Contact your organization administrator for more information.')
    ).not.toBeInTheDocument();
  });

  it('should pass through all PageHeader props', () => {
    render(
      <PageLayoutWithUnauthorized
        {...defaultProps}
        titleHelpTitle="Help Title"
        titleHelp="Help content for the page"
      >
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    // The title should be rendered
    expect(screen.getByText('Test Page')).toBeInTheDocument();
  });

  it('should render header even in unauthorized state', () => {
    render(
      <PageLayoutWithUnauthorized {...defaultProps} isUnauthorized={true}>
        <div>Content</div>
      </PageLayoutWithUnauthorized>
    );

    // Header should still be visible
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });
});
