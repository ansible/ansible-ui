/* eslint-disable i18next/no-literal-string */
import { Button, Modal, ModalBody, ModalHeader, PageSection } from '@patternfly/react-core';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PageDialogProvider, usePageDialogs } from './PageDialog';

// Mock focus-trap to avoid issues with testing modals
vi.mock('focus-trap', () => ({
  createFocusTrap: () => ({
    activate: vi.fn(),
    deactivate: vi.fn(),
    pause: vi.fn(),
    unpause: vi.fn(),
  }),
}));

function TestComponent() {
  const { pushDialog, popDialog } = usePageDialogs();

  const secondDialog = (
    <Modal isOpen key="second" onClose={popDialog} disableFocusTrap>
      <ModalHeader title="Second Modal" />
      <ModalBody>
        <Button variant="primary">Placeholder</Button>
      </ModalBody>
    </Modal>
  );

  const openSecondDialog = () => pushDialog(secondDialog);

  const firstDialog = (
    <Modal isOpen key="first" onClose={popDialog} disableFocusTrap>
      <ModalHeader title="First Modal" />
      <ModalBody>
        <Button variant="primary" onClick={openSecondDialog}>
          Open second dialog
        </Button>
      </ModalBody>
    </Modal>
  );

  const openFirstDialog = () => pushDialog(firstDialog);

  return (
    <PageSection hasBodyWrapper={false}>
      <Button variant="primary" onClick={openFirstDialog}>
        Open first dialog
      </Button>
    </PageSection>
  );
}

describe('PageDialogs', () => {
  beforeAll(() => {
    // Create a portal container for modals
    const portalRoot = document.createElement('div');
    portalRoot.setAttribute('id', 'portal-root');
    document.body.appendChild(portalRoot);
  });

  afterAll(() => {
    const portalRoot = document.getElementById('portal-root');
    portalRoot?.remove();
  });

  it('should be able to open and close multiple dialogs', async () => {
    const user = userEvent.setup();

    render(
      <PageDialogProvider>
        <TestComponent />
      </PageDialogProvider>
    );

    // Open first dialog
    await user.click(screen.getByRole('button', { name: 'Open first dialog' }));
    await waitFor(() => {
      expect(screen.getByText('First Modal')).toBeInTheDocument();
    });

    // Open second dialog
    await user.click(screen.getByRole('button', { name: 'Open second dialog' }));
    await waitFor(() => {
      expect(screen.getByText('Second Modal')).toBeInTheDocument();
    });

    // Close second dialog
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    await user.click(closeButtons.at(-1)!);

    await waitFor(() => {
      expect(screen.queryByText('Second Modal')).not.toBeInTheDocument();
    });
    expect(screen.getByText('First Modal')).toBeInTheDocument();

    // Close first dialog
    await user.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByText('First Modal')).not.toBeInTheDocument();
    });
  });
});
