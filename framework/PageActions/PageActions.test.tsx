import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IPageAction,
  IPageActionButtonSingle,
  PageActionSelection,
  PageActionType,
} from './PageAction';
import { PageActions } from './PageActions';

vi.mock('../components/useBreakPoint', () => ({
  useBreakpoint: vi.fn(() => true),
  WindowSize: {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    xxl: 'xxl',
  },
}));

import { useBreakpoint } from '../components/useBreakPoint';

type TestItem = { id: number; name: string };

describe('PageActions', () => {
  const mockItem: TestItem = { id: 1, name: 'Test Item' };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useBreakpoint).mockReturnValue(true);
  });

  describe('rendering', () => {
    it('should render empty when no actions provided', () => {
      const { container } = renderWithRouter(<PageActions actions={[]} />);
      expect(container).toBeDefined();
    });

    it('should render pinned button actions', () => {
      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Edit',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} />);
      expect(screen.getByRole('button', { name: 'Edit' })).toBeDefined();
    });

    it('should render dropdown for non-pinned actions', () => {
      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Delete',
          onClick: vi.fn(),
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} />);
      expect(screen.getByRole('button')).toBeDefined();
    });
  });

  describe('visibility', () => {
    it('should show actions when isHidden returns false', () => {
      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Visible Action',
          onClick: vi.fn(),
          isPinned: true,
          isHidden: () => false,
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} />);
      expect(screen.getByRole('button', { name: 'Visible Action' })).toBeDefined();
    });
  });

  describe('collapsing', () => {
    it('should collapse all actions when collapse is always', () => {
      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Action 1',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Action 2',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} collapse="always" />);

      expect(screen.queryByRole('button', { name: 'Action 1' })).toBeNull();
    });

    it('should not collapse when collapse is never', () => {
      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Never Collapse',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} collapse="never" />);

      expect(screen.getByRole('button', { name: 'Never Collapse' })).toBeDefined();
    });

    it('should collapse based on breakpoint', () => {
      vi.mocked(useBreakpoint).mockReturnValue(false);

      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Breakpoint Action',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} collapse="lg" />);

      expect(screen.queryByRole('button', { name: 'Breakpoint Action' })).toBeNull();
    });
  });

  describe('multiple actions', () => {
    it('should render both pinned and dropdown actions', () => {
      vi.mocked(useBreakpoint).mockReturnValue(true);

      const actions: IPageAction<TestItem>[] = [
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Pinned',
          onClick: vi.fn(),
          isPinned: true,
        } as IPageActionButtonSingle<TestItem>,
        {
          type: PageActionType.Button,
          selection: PageActionSelection.Single,
          label: 'Dropdown',
          onClick: vi.fn(),
        } as IPageActionButtonSingle<TestItem>,
      ];

      renderWithRouter(<PageActions actions={actions} selectedItem={mockItem} />);

      expect(screen.getByRole('button', { name: 'Pinned' })).toBeDefined();
      expect(screen.getAllByRole('button').length).toBeGreaterThan(1);
    });
  });
});
