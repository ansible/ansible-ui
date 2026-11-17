import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { IPageActionSwitchSingle, PageActionSelection, PageActionType } from './PageAction';
import { PageActionSwitch } from './PageActionSwitch';

describe('PageActionSwitch', () => {
  const pageActionSwitchFlag = true;

  it('shows switch with the correct initial state', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      label: '',
    };

    render(<PageActionSwitch action={action} selectedItem={resource} />);

    const checkbox = screen.getByRole('switch');
    expect(checkbox).toBeChecked();
  });

  it('switch is disabled when isDisabled returns a string', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => 'instance disabled',
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      label: 'switch disabled',
    };

    render(<PageActionSwitch action={{ ...action }} selectedItem={resource} />);

    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('toggles switch state when clicked', async () => {
    const user = userEvent.setup();

    const StatefulSwitchWrapper: React.FC = () => {
      const [enabled, setEnabled] = useState(true);
      const resource = { enabled };

      const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
        type: PageActionType.Switch,
        onToggle: (_selectedItem, newValue) => {
          setEnabled(newValue);
        },
        isSwitchOn: (res) => res.enabled,
        ariaLabel: () => 'instance enabled',
        selection: PageActionSelection.Single,
        label: 'instance enabled',
      };

      return <PageActionSwitch action={action} selectedItem={resource} />;
    };

    render(<StatefulSwitchWrapper />);

    const checkbox = screen.getByRole('switch');
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-label', 'instance enabled');

    // Click the switch toggle
    const switchToggle = document.querySelector('span.pf-v6-c-switch__toggle');
    expect(switchToggle).toBeInTheDocument();
    await user.click(switchToggle!);

    await waitFor(() => {
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    // Click again to toggle back
    await user.click(switchToggle!);

    await waitFor(() => {
      expect(screen.getByRole('switch')).toBeChecked();
    });
  });

  it('shows icon-only tooltip when action provides tooltip', async () => {
    const user = userEvent.setup();
    const resource = { enabled: true };
    render(
      <PageActionSwitch
        action={{
          type: PageActionType.Switch,
          selection: PageActionSelection.Single,
          label: 'Pinned label',
          tooltip: 'Pinned tooltip',
          isSwitchOn: (item) => item.enabled,
          onToggle: vi.fn(),
          ariaLabel: () => 'switch',
        }}
        selectedItem={resource}
        iconOnly
      />
    );
    await user.hover(screen.getByRole('switch'));
    expect(await screen.findByText('Pinned tooltip')).toBeInTheDocument();
  });

  it('hides icon-only labels unless showPinnedLabel is set', () => {
    render(
      <PageActionSwitch
        action={{
          type: PageActionType.Switch,
          selection: PageActionSelection.Single,
          label: 'Hidden label',
          showPinnedLabel: true,
          isSwitchOn: () => true,
          onToggle: vi.fn(),
          ariaLabel: () => 'switch',
        }}
        selectedItem={{ enabled: true }}
        iconOnly
      />
    );
    expect(screen.getByText('Hidden label')).toBeInTheDocument();
  });

  it('toggles using selection none callbacks', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <PageActionSwitch
        action={{
          type: PageActionType.Switch,
          selection: PageActionSelection.None,
          label: 'Global',
          isSwitchOn: () => false,
          onToggle,
          ariaLabel: () => 'global',
        }}
      />
    );
    const toggle = document.querySelector('span.pf-v6-c-switch__toggle');
    expect(toggle).toBeInTheDocument();
    if (toggle) await user.click(toggle);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('switch is enabled when isDisabled is undefined', () => {
    const resource: { enabled: boolean } = { enabled: true };
    const action: IPageActionSwitchSingle<{ enabled: boolean }> = {
      type: PageActionType.Switch,
      onToggle: () => {
        return !pageActionSwitchFlag;
      },
      isSwitchOn: (resource) => resource?.enabled,
      isDisabled: () => undefined,
      ariaLabel: (isEnabled: boolean) => (isEnabled ? 'Enabled' : 'Disabled'),
      selection: PageActionSelection.Single,
      label: '',
    };

    render(<PageActionSwitch action={action} selectedItem={resource} />);

    expect(screen.getByRole('switch')).not.toBeDisabled();
  });
});
