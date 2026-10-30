import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  PageNavigationRoutesProvider,
  usePageNavigationRoutesContext,
} from '@ansible/ansible-ui-framework/PageNavigation/PageNavigationRoutesProvider';
import { PageRoutedTabs, parseQuery } from './PageRoutedTabs';

const mockSetTabBreadcrumb = vi.fn();
vi.mock('@ansible/ansible-ui-framework/PageTabs/PageBreadcrumbs', () => ({
  usePageBreadcrumbs: () => ({
    setTabBreadcrumb: mockSetTabBreadcrumb,
    tabBreadcrumb: undefined,
  }),
}));

describe('parseQuery', () => {
  it('should decode "+" in a value back to a space', () => {
    expect(parseQuery('?name__icontains=x+y+z')).toEqual({ name__icontains: 'x y z' });
  });

  it('should decode percent-encoded spaces', () => {
    expect(parseQuery('?name__icontains=x%20y%20z')).toEqual({ name__icontains: 'x y z' });
  });

  it('should parse a string with no leading question mark', () => {
    expect(parseQuery('name__icontains=x+y+z')).toEqual({ name__icontains: 'x y z' });
  });

  it('should parse multiple parameters', () => {
    expect(parseQuery('?name__icontains=my+template&page_size=50')).toEqual({
      name__icontains: 'my template',
      page_size: '50',
    });
  });

  it('should decode a value only once', () => {
    expect(parseQuery('?name__icontains=100%2525')).toEqual({ name__icontains: '100%25' });
  });

  it('should keep a value containing "="', () => {
    expect(parseQuery('?filter=a%3Db')).toEqual({ filter: 'a=b' });
  });

  it('should keep an empty value', () => {
    expect(parseQuery('?name__icontains=')).toEqual({ name__icontains: '' });
  });

  it('should return an empty object for an empty string', () => {
    expect(parseQuery('')).toEqual({});
  });
});

function RegisterRoutes(props: { children: React.ReactNode }) {
  const [, setNavigation] = usePageNavigationRoutesContext();
  useEffect(
    () =>
      setNavigation([
        { id: 'templates', path: 'templates', label: 'Templates', element: <div /> },
        {
          id: 'template-details',
          path: 'templates/:id/details',
          label: 'Template details',
          element: <div />,
        },
      ]),
    [setNavigation]
  );
  return <>{props.children}</>;
}

describe('PageRoutedTabs back tab', () => {
  afterEach(() => {
    sessionStorage.clear();
    mockSetTabBreadcrumb.mockClear();
  });

  function renderBackTab() {
    render(
      <MemoryRouter initialEntries={['/templates/1/details']}>
        <PageNavigationRoutesProvider>
          <RegisterRoutes>
            <PageRoutedTabs
              backTab={{
                label: 'Back to Templates',
                page: 'templates',
                persistentFilterKey: 'templates',
              }}
              tabs={[{ label: 'Details', page: 'template-details' }]}
            />
          </RegisterRoutes>
        </PageNavigationRoutesProvider>
      </MemoryRouter>
    );
    return screen.getByRole('tab', { name: /Back to Templates/ });
  }

  it('should preserve spaces in the persisted search when linking back to the list', () => {
    sessionStorage.setItem(
      'persistent-filter',
      JSON.stringify({ pageKey: 'templates', qs: '?name__icontains=x+y+z' })
    );

    expect(renderBackTab()).toHaveAttribute('href', '/templates?name__icontains=x%20y%20z');
  });

  it('should not add a filter when the persisted filter belongs to another page', () => {
    sessionStorage.setItem(
      'persistent-filter',
      JSON.stringify({ pageKey: 'projects', qs: '?name__icontains=x+y+z' })
    );

    expect(renderBackTab()).toHaveAttribute('href', '/templates?');
  });

  it('should set tab breadcrumb when an active tab is matched', () => {
    renderBackTab();
    expect(mockSetTabBreadcrumb).toHaveBeenCalledWith({ label: 'Details' });
  });
});

function RegisterDetailRoutes(props: { children: React.ReactNode }) {
  const [, setNavigation] = usePageNavigationRoutesContext();
  useEffect(
    () =>
      setNavigation([
        { id: 'details', path: 'templates/:id/details', label: 'Details', element: <div /> },
        { id: 'jobs', path: 'templates/:id/jobs', label: 'Jobs', element: <div /> },
      ]),
    [setNavigation]
  );
  return <>{props.children}</>;
}

describe('PageRoutedTabs shared query keys', () => {
  afterEach(() => sessionStorage.clear());

  it('should preserve shared query keys in tab links', () => {
    render(
      <MemoryRouter initialEntries={['/templates/1/details?status=failed&page=2']}>
        <PageNavigationRoutesProvider>
          <RegisterDetailRoutes>
            <Routes>
              <Route
                path="/templates/:id/*"
                element={
                  <PageRoutedTabs
                    sharedQueryKeys={['status']}
                    tabs={[
                      { label: 'Details', page: 'details', dataCy: 'details-tab' },
                      { label: 'Jobs', page: 'jobs', dataCy: 'jobs-tab' },
                    ]}
                    params={{ id: 1 }}
                  />
                }
              />
            </Routes>
          </RegisterDetailRoutes>
        </PageNavigationRoutesProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('jobs-tab')).toHaveAttribute(
      'href',
      expect.stringContaining('status=failed')
    );
    expect(screen.getByTestId('jobs-tab')).toHaveAttribute(
      'href',
      expect.not.stringContaining('page=2')
    );
  });
});
