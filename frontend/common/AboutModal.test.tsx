import { PageDialogProvider } from '@ansible/ansible-ui-framework';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAnsibleAboutModal } from './AboutModal';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  const PfAboutModal = actual.AboutModal;
  return {
    ...actual,
    AboutModal: (props: ComponentProps<typeof PfAboutModal>) => (
      <PfAboutModal {...props} disableFocusTrap />
    ),
  };
});

function OpenAboutModal(props: { onClose?: () => void }) {
  const setProps = useAnsibleAboutModal();
  useEffect(() => {
    setProps({ brandImageSrc: '/logo.svg', onClose: props.onClose });
  }, [props.onClose, setProps]);
  return null;
}

describe('useAnsibleAboutModal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should render about modal with version and trademark', async () => {
    vi.stubEnv('VERSION', '4.5.6');
    vi.stubEnv('PRODUCT', 'AWX');

    render(
      <PageDialogProvider>
        <OpenAboutModal />
      </PageDialogProvider>
    );

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Version')).toBeInTheDocument();
    expect(within(dialog).getByText('4.5.6')).toBeInTheDocument();
    expect(within(dialog).getByText(/Copyright .* Red Hat, Inc\./)).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Brand Logo' })).toHaveAttribute(
      'src',
      '/logo.svg'
    );
  });

  it('should close modal and invoke onClose callback', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <PageDialogProvider>
        <OpenAboutModal onClose={onClose} />
      </PageDialogProvider>
    );

    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /close/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
