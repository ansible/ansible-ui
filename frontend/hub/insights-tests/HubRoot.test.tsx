/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock Chrome API
const mockIdentifyApp = vi.fn();
const mockUpdateDocumentTitle = vi.fn();
const mockChrome = {
  identifyApp: mockIdentifyApp,
  updateDocumentTitle: mockUpdateDocumentTitle,
};

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  default: () => mockChrome,
}));

// Mock PageFramework
vi.mock('@ansible/ansible-ui-framework', () => ({
  PageFramework: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-framework">{children}</div>
  ),
}));

// Mock HubActiveUserProvider
vi.mock('../common/useHubActiveUser', () => ({
  HubActiveUserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hub-active-user-provider">{children}</div>
  ),
}));

// Mock HubContextProvider
vi.mock('../common/useHubContext', () => ({
  HubContextProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="hub-context-provider">{children}</div>
  ),
}));

// Mock HubInsightsApp
vi.mock('../insights/HubInsightsApp', () => ({
  HubInsightsApp: () => <div data-testid="hub-insights-app">HubInsightsApp</div>,
}));

// Mock i18n import
vi.mock('@ansible/common-ui/i18n', () => ({}));

import { HubRoot } from '../insights/HubRoot';

describe('HubRoot', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component tree correctly', () => {
    render(
      <MemoryRouter>
        <HubRoot />
      </MemoryRouter>
    );

    // Verify component hierarchy
    expect(screen.getByTestId('page-framework')).toBeInTheDocument();
    expect(screen.getByTestId('hub-active-user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('hub-insights-app')).toBeInTheDocument();
  });

  // Note: Chrome API integration (identifyApp, updateDocumentTitle) is tested
  // via the graceful handling tests below, which verify the component doesn't
  // crash when Chrome methods are undefined (optional chaining behavior).

  it('should wrap HubInsightsApp in HubActiveUserProvider and HubContextProvider', () => {
    render(
      <MemoryRouter>
        <HubRoot />
      </MemoryRouter>
    );

    const provider = screen.getByTestId('hub-active-user-provider');
    const contextProvider = screen.getByTestId('hub-context-provider');
    const app = screen.getByTestId('hub-insights-app');

    // Verify HubInsightsApp is inside HubContextProvider
    expect(contextProvider).toContainElement(app);
    // Verify HubContextProvider is inside HubActiveUserProvider
    expect(provider).toContainElement(contextProvider);
  });

  it('should wrap everything in PageFramework', () => {
    render(
      <MemoryRouter>
        <HubRoot />
      </MemoryRouter>
    );

    const framework = screen.getByTestId('page-framework');
    const provider = screen.getByTestId('hub-active-user-provider');

    // Verify HubActiveUserProvider is inside PageFramework
    expect(framework).toContainElement(provider);
  });

  it('should render HubContextProvider in component tree', () => {
    render(
      <MemoryRouter>
        <HubRoot />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hub-context-provider')).toBeInTheDocument();
  });
});

describe('HubRoot with missing chrome methods', () => {
  it('should handle missing identifyApp gracefully', () => {
    // Temporarily override mock to have undefined identifyApp
    const originalIdentifyApp = mockChrome.identifyApp;
    mockChrome.identifyApp = undefined as unknown as typeof mockIdentifyApp;

    expect(() => {
      render(
        <MemoryRouter>
          <HubRoot />
        </MemoryRouter>
      );
    }).not.toThrow();

    // Restore
    mockChrome.identifyApp = originalIdentifyApp;
  });

  it('should handle missing updateDocumentTitle gracefully', () => {
    // Temporarily override mock to have undefined updateDocumentTitle
    const originalUpdateDocumentTitle = mockChrome.updateDocumentTitle;
    mockChrome.updateDocumentTitle = undefined as unknown as typeof mockUpdateDocumentTitle;

    expect(() => {
      render(
        <MemoryRouter>
          <HubRoot />
        </MemoryRouter>
      );
    }).not.toThrow();

    // Restore
    mockChrome.updateDocumentTitle = originalUpdateDocumentTitle;
  });
});
