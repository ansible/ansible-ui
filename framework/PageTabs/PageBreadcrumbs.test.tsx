import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PageBreadcrumbsProvider, usePageBreadcrumbs } from './PageBreadcrumbs';

function BreadcrumbWriter() {
  const { setTabBreadcrumb } = usePageBreadcrumbs();
  return (
    <button type="button" onClick={() => setTabBreadcrumb({ label: 'Jobs', to: '/jobs' })}>
      Set breadcrumb
    </button>
  );
}

function BreadcrumbReader() {
  const { tabBreadcrumb } = usePageBreadcrumbs();
  return <div data-testid="crumb">{tabBreadcrumb?.label ?? 'none'}</div>;
}

describe('PageBreadcrumbs', () => {
  it('updates tab breadcrumb through context', async () => {
    const user = userEvent.setup();
    render(
      <PageBreadcrumbsProvider>
        <BreadcrumbWriter />
        <BreadcrumbReader />
      </PageBreadcrumbsProvider>
    );

    expect(screen.getByTestId('crumb')).toHaveTextContent('none');
    await user.click(screen.getByRole('button', { name: 'Set breadcrumb' }));
    expect(screen.getByTestId('crumb')).toHaveTextContent('Jobs');
  });

  it('exposes default context values outside a provider', () => {
    const { result } = renderHook(() => usePageBreadcrumbs());
    expect(result.current.tabBreadcrumb).toEqual({});
    act(() => {
      result.current.setTabBreadcrumb({ label: 'noop' });
    });
    expect(result.current.tabBreadcrumb).toEqual({});
  });
});
