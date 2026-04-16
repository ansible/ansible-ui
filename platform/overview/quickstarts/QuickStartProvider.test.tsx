import '@testing-library/jest-dom/vitest';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QuickStartProvider } from './QuickStartProvider';
import { QuickStartsPage } from './Quickstarts';

vi.mock('../../main/GatewayServices', () => ({
  useHasHubService: () => true,
}));

function renderQuickStarts() {
  return render(
    <MemoryRouter>
      <QuickStartProvider>
        <QuickStartsPage />
      </QuickStartProvider>
    </MemoryRouter>
  );
}

describe('Quick starts drawer integration', () => {
  it('should open drawer when a quick start card is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderQuickStarts();

    const card = await waitFor(
      () => {
        const el = container.querySelector('button[id="create-organization"]');
        expect(el).toBeTruthy();
        return el!;
      },
      { timeout: 5000 }
    );

    await user.click(card);

    await waitFor(() => {
      const drawer = container.querySelector('[data-test="quickstart drawer"]');
      expect(drawer).toBeTruthy();
    });
  });

  it('should close drawer when close button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = renderQuickStarts();

    const card = await waitFor(
      () => {
        const el = container.querySelector('button[id="create-organization"]');
        expect(el).toBeTruthy();
        return el!;
      },
      { timeout: 5000 }
    );

    await user.click(card);

    const drawer = await waitFor(() => {
      const el = container.querySelector('[data-test="quickstart drawer"]');
      expect(el).toBeTruthy();
      return el!;
    });

    const closeButton = drawer.querySelector('[class*="drawer__close"] button');
    if (!closeButton) throw new Error('Close button not found in drawer');
    await user.click(closeButton);

    await waitFor(() => {
      expect(container.querySelector('[data-test="quickstart drawer"]')).toBeNull();
    });
  });
});
