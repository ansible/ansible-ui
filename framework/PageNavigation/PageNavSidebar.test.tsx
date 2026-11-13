import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PageNavSideBarProvider, usePageNavBarClick, usePageNavSideBar } from './PageNavSidebar';

vi.mock('../components/useBreakPoint', () => ({ useBreakpoint: vi.fn(() => false) }));

function SidebarState() {
  const { isOpen, setState } = usePageNavSideBar();
  return (
    <div>
      <span data-testid="open">{String(isOpen)}</span>
      <button type="button" onClick={() => setState({ isOpen: true })}>
        Open
      </button>
    </div>
  );
}

function NavClick() {
  const onClick = usePageNavBarClick();
  return (
    <button type="button" onClick={() => onClick('/items')}>
      Navigate
    </button>
  );
}

describe('PageNavSidebar', () => {
  it('toggles open state and navigates', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageNavSideBarProvider>
          <SidebarState />
          <NavClick />
        </PageNavSideBarProvider>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByTestId('open')).toHaveTextContent('true');
    await user.click(screen.getByRole('button', { name: 'Navigate' }));
    await waitFor(() => expect(screen.getByTestId('open')).toHaveTextContent('false'));
  });
});
