import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageControls } from './PageControls';

describe('PageControls', () => {
  it('should invoke scroll handlers when buttons are clicked', async () => {
    const user = userEvent.setup();
    const onScrollFirst = vi.fn();
    const onScrollLast = vi.fn();
    const onScrollNext = vi.fn();
    const onScrollPrevious = vi.fn();

    render(
      <PageControls
        onScrollFirst={onScrollFirst}
        onScrollLast={onScrollLast}
        onScrollNext={onScrollNext}
        onScrollPrevious={onScrollPrevious}
        isFlatMode
        isTemplateJob={false}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Scroll previous' }));
    await user.click(screen.getByRole('button', { name: 'Scroll next' }));
    await user.click(screen.getByRole('button', { name: 'Scroll first' }));
    await user.click(screen.getByRole('button', { name: 'Scroll last' }));

    expect(onScrollPrevious).toHaveBeenCalledTimes(1);
    expect(onScrollNext).toHaveBeenCalledTimes(1);
    expect(onScrollFirst).toHaveBeenCalledTimes(1);
    expect(onScrollLast).toHaveBeenCalledTimes(1);
  });

  it('should show expand/collapse control for template jobs in tree mode', async () => {
    const user = userEvent.setup();
    const toggleExpandCollapseAll = vi.fn();

    render(
      <PageControls
        onScrollFirst={vi.fn()}
        onScrollLast={vi.fn()}
        onScrollNext={vi.fn()}
        onScrollPrevious={vi.fn()}
        toggleExpandCollapseAll={toggleExpandCollapseAll}
        isAllCollapsed
        isFlatMode={false}
        isTemplateJob
      />
    );

    await user.click(screen.getByRole('button', { name: 'Expand job events' }));
    expect(toggleExpandCollapseAll).toHaveBeenCalledTimes(1);
  });
});
