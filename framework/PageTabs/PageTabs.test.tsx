import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PageTab, PageTabs } from './PageTabs';

describe('PageTabs', () => {
  it('renders tab labels and shows the initial tab content', () => {
    render(
      <PageTabs initialTabIndex={0}>
        <PageTab label="First">
          <div>First panel</div>
        </PageTab>
        <PageTab label="Second">
          <div>Second panel</div>
        </PageTab>
      </PageTabs>
    );

    expect(screen.getByRole('tab', { name: 'First' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Second' })).toBeInTheDocument();
    expect(screen.getByText('First panel')).toBeInTheDocument();
    expect(screen.queryByText('Second panel')).not.toBeInTheDocument();
  });

  it('switches tab content when a tab is selected', async () => {
    const user = userEvent.setup();
    render(
      <PageTabs>
        <PageTab label="One">
          <div>Panel one</div>
        </PageTab>
        <PageTab label="Two">
          <div>Panel two</div>
        </PageTab>
      </PageTabs>
    );

    await user.click(screen.getByRole('tab', { name: 'Two' }));
    expect(screen.getByText('Panel two')).toBeInTheDocument();
    expect(screen.queryByText('Panel one')).not.toBeInTheDocument();
  });

  it('renders a loading skeleton state', () => {
    const { container } = render(
      <PageTabs loading>
        <PageTab label="Hidden">
          <div>Hidden</div>
        </PageTab>
      </PageTabs>
    );

    expect(container.querySelector('.pf-v6-c-skeleton')).toBeTruthy();
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders a skeleton tab title when PageTab has no label', () => {
    const { container } = render(
      <PageTabs>
        <PageTab>
          <div>Unlabeled content</div>
        </PageTab>
      </PageTabs>
    );

    expect(container.querySelector('.pf-v6-c-skeleton')).toBeTruthy();
    expect(screen.getByText('Unlabeled content')).toBeInTheDocument();
  });
});
