import { Toolbar, ToolbarContent } from '@patternfly/react-core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PageTableViewType, PageTableViewTypeE } from './PageTableViewType';
import { PageToolbarView } from './PageToolbarView';

describe('PageToolbarView', () => {
  it('switches view types and opens the column modal', async () => {
    const user = userEvent.setup();
    const openColumnModal = vi.fn();

    function Harness() {
      const [viewType, setViewType] = useState<PageTableViewType>(PageTableViewTypeE.Table);
      return (
        <Toolbar>
          <ToolbarContent>
            <PageToolbarView
              viewType={viewType}
              setViewType={setViewType}
              openColumnModal={openColumnModal}
            />
          </ToolbarContent>
        </Toolbar>
      );
    }

    render(<Harness />);
    await user.click(screen.getByTestId('list-view'));
    await user.click(screen.getByTestId('card-view'));
    const [columnButton] = document.querySelectorAll('.pf-v6-c-toolbar__item button');
    await user.click(columnButton as Element);
    expect(openColumnModal).toHaveBeenCalled();
  });
});
