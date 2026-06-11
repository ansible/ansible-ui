/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Navigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the framework's PageNavigationRoutesProvider
const mockSetNavigation = vi.fn();
vi.mock('@ansible/ansible-ui-framework/PageNavigation/PageNavigationRoutesProvider', () => ({
  usePageNavigationRoutesContext: () => [[], mockSetNavigation],
}));

// Mock PageNotFound component
vi.mock('@ansible/ansible-ui-framework/PageEmptyStates/PageNotFound', () => ({
  PageNotFound: () => <div data-testid="page-not-found">Page Not Found</div>,
}));

// Mock Collections component
vi.mock('../collections/Collections', () => ({
  Collections: () => <div data-testid="collections">Collections</div>,
}));

// Mock useHubNavigation hook
vi.mock('../main/useHubNavigation', () => ({
  useHubNavigation: () => [
    {
      id: 'collections',
      label: 'Collections',
      path: 'collections',
      element: <div data-testid="nav-collections">Collections Page</div>,
    },
    {
      id: 'namespaces',
      label: 'Namespaces',
      path: 'namespaces',
      element: <div data-testid="nav-namespaces">Namespaces Page</div>,
    },
    {
      id: 'with-children',
      label: 'With Children',
      path: 'parent',
      element: <div data-testid="parent-element">Parent</div>,
      children: [
        {
          id: 'redirect',
          path: '',
          element: <Navigate to="details" replace />,
        },
        {
          id: 'child-details',
          label: 'Details',
          path: 'details',
          element: <div data-testid="child-details">Child Details</div>,
        },
      ],
    },
    {
      id: 'group-without-element',
      label: 'Group',
      path: 'group',
      children: [
        {
          id: 'group-child',
          label: 'Group Child',
          path: 'item',
          element: <div data-testid="group-child">Group Child</div>,
        },
      ],
    },
  ],
}));

import { HubInsightsApp } from '../insights/HubInsightsApp';

describe('HubInsightsApp', () => {
  beforeEach(() => {
    mockSetNavigation.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the Collections component at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('collections')).toBeInTheDocument();
  });

  it('should render the Collections component at empty path', () => {
    render(
      <MemoryRouter initialEntries={['']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('collections')).toBeInTheDocument();
  });

  it('should render navigation route elements', () => {
    render(
      <MemoryRouter initialEntries={['/collections']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('nav-collections')).toBeInTheDocument();
  });

  it('should render the PageNotFound component for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('page-not-found')).toBeInTheDocument();
  });

  it('should render parent elements with children routes', () => {
    // When navigating to parent path, the parent element should render
    // Note: Nested child routes require <Outlet /> in parent to render children
    render(
      <MemoryRouter initialEntries={['/parent/details']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('parent-element')).toBeInTheDocument();
  });

  it('should render group children without parent element', () => {
    render(
      <MemoryRouter initialEntries={['/group/item']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('group-child')).toBeInTheDocument();
  });

  it('should register navigation with the framework', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    // Verify setNavigation was called with navigation items
    expect(mockSetNavigation).toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const callArg = mockSetNavigation.mock.calls[0]?.[0];
    expect(callArg).toHaveLength(1);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(callArg?.[0].path).toBe('/ansible/automation-hub');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(callArg?.[0].children).toBeDefined();
  });

  it('should handle namespaces route', () => {
    render(
      <MemoryRouter initialEntries={['/namespaces']}>
        <HubInsightsApp />
      </MemoryRouter>
    );

    expect(screen.getByTestId('nav-namespaces')).toBeInTheDocument();
  });
});
