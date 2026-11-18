/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PageNavigationItem } from './PageNavigationItem';
import { PageNavigation } from './PageNavigation';
import { PageNavSideBarProvider } from './PageNavSidebar';

vi.mock('../components/useBreakPoint', () => ({ useBreakpoint: vi.fn(() => true) }));

const routeStub = <div />;

function renderNavigation(
  navigation: PageNavigationItem[],
  options?: { basename?: string; initialPath?: string }
) {
  const initialPath = options?.initialPath ?? '/items';
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <PageNavSideBarProvider>
        <Routes>
          <Route
            path="*"
            element={
              <PageNavigation
                navigation={navigation}
                basename={options?.basename}
                contextSwitcher={<a href="/switch">Switch</a>}
              />
            }
          />
        </Routes>
      </PageNavSideBarProvider>
    </MemoryRouter>
  );
}

describe('PageNavigation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders sidebar navigation with context switcher and leaf item', () => {
    const navigation: PageNavigationItem[] = [
      {
        id: 'items',
        label: 'Items',
        path: 'items',
        subtitle: 'All items',
        badge: '3',
        badgeColor: 'blue',
        element: routeStub,
      },
    ];

    renderNavigation(navigation);

    expect(screen.getByTestId('page-navigation')).toBeInTheDocument();
    expect(screen.getByText('Switch')).toBeInTheDocument();
    expect(screen.getByTestId('items')).toHaveTextContent('Items');
    expect(screen.getByText('All items')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('omits hidden navigation items', () => {
    renderNavigation([
      { id: 'visible', label: 'Visible', path: 'visible', element: routeStub },
      { id: 'hidden', label: 'Hidden', path: 'hidden', hidden: true, element: routeStub },
    ]);

    expect(screen.getByTestId('visible')).toBeInTheDocument();
    expect(screen.queryByTestId('hidden')).not.toBeInTheDocument();
  });

  it('expands nested navigation and persists expansion in localStorage', async () => {
    const user = userEvent.setup();
    const navigation: PageNavigationItem[] = [
      {
        id: 'group',
        label: 'Group',
        path: 'group',
        children: [{ id: 'child', label: 'Child', path: 'child', element: routeStub }],
      },
    ];

    renderNavigation(navigation, { initialPath: '/group/child' });

    const groupToggle = screen.getByRole('button', { name: /Group/i });
    await user.click(groupToggle);

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(localStorage.getItem('group-expanded')).toBe('true');
  });

  it('opens external links in a new tab', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    renderNavigation([
      { id: 'docs', label: 'Docs', path: 'docs', href: 'https://example.com', element: routeStub },
    ]);

    await user.click(screen.getByTestId('docs'));
    expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('renders root children when path is slash', () => {
    renderNavigation([
      {
        path: '/',
        children: [
          { id: 'root-child', label: 'Root child', path: 'root-child', element: routeStub },
        ],
      },
    ]);

    expect(screen.getByTestId('root-child')).toBeInTheDocument();
  });
});
