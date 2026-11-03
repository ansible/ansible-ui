import { beforeEach, describe, expect, it, vi } from 'vitest';

const render = vi.fn();
const createRoot = vi.fn(() => ({ render }));

vi.mock('react-dom/client', () => ({
  createRoot,
}));

vi.mock('./EdaMain', () => ({
  default: () => null,
}));

describe('Eda entry', () => {
  beforeEach(() => {
    render.mockClear();
    createRoot.mockClear();
    createRoot.mockReturnValue({ render });
    document.body.innerHTML = '';
  });

  it('should mount the app into a newly created #app element', async () => {
    await import('./Eda');

    expect(document.getElementById('app')).not.toBeNull();
    expect(createRoot).toHaveBeenCalled();
    expect(render).toHaveBeenCalled();
  });
});
