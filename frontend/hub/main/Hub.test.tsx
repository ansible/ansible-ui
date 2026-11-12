import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRender = vi.fn();

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({ render: mockRender })),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    lazy: () => {
      const Component = () => null;
      Component.displayName = 'LazyHubMain';
      return Component;
    },
  };
});

describe('Hub entry', () => {
  beforeEach(() => {
    mockRender.mockClear();
    document.body.innerHTML = '';
  });

  it('creates a root and renders the lazy hub main module', async () => {
    document.body.innerHTML = '<div id="app"></div>';
    vi.resetModules();
    await import('./Hub');

    expect(mockRender).toHaveBeenCalledTimes(1);
  });
});
