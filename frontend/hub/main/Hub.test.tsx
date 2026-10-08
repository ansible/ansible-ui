import { describe, expect, it, vi } from 'vitest';

const renderMock = vi.fn();

vi.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: renderMock,
  }),
}));

vi.mock('./HubMain', () => ({
  default: () => null,
}));

describe('Hub entry', () => {
  it('mounts HubMain into the app root', async () => {
    await import('./Hub');

    expect(renderMock).toHaveBeenCalled();
    expect(document.getElementById('app')).not.toBeNull();
  });
});
