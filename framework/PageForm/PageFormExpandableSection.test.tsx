import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PageFormExpandableSection } from './PageFormExpandableSection';

describe('PageFormExpandableSection', () => {
  const childrenContent = 'Test';

  it('should expand the section when clicked on', async () => {
    const user = userEvent.setup();

    render(
      <PageFormExpandableSection singleColumn={true}>
        <div id="expandable-section">{childrenContent}</div>
      </PageFormExpandableSection>
    );

    // Initially collapsed - content should not be visible
    expect(screen.queryByText(childrenContent)).not.toBeVisible();

    // Click to expand
    await user.click(screen.getByRole('button', { name: /show advanced options/i }));

    // Content should now be visible
    expect(screen.getByText(childrenContent)).toBeVisible();
    expect(screen.getByRole('button', { name: /hide advanced options/i })).toBeInTheDocument();

    // Click to collapse
    await user.click(screen.getByRole('button', { name: /hide advanced options/i }));

    // Content should be hidden again
    expect(screen.queryByText(childrenContent)).not.toBeVisible();
    expect(screen.getByRole('button', { name: /show advanced options/i })).toBeInTheDocument();
  });
});
