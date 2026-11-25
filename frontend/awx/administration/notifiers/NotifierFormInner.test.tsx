import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { InnerForm, getLabelHelp, twilioPhoneNumber, validateUrl } from './NotifierFormInner';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';

const translate = ((key: string | TemplateStringsArray) =>
  Array.isArray(key) ? String(key[0]) : key) as unknown as Parameters<typeof getLabelHelp>[2];

vi.mock('@ansible/ansible-ui-framework', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ansible/ansible-ui-framework')>();
  return {
    ...actual,
    PageFormDataEditor: ({ label }: { label: string }) => (
      <div data-testid="page-form-data-editor">{label}</div>
    ),
  };
});

function TestWrapper({
  children,
  notification_type,
}: {
  children: React.ReactNode;
  notification_type: string;
}) {
  const methods = useForm<NotificationTemplate>({
    defaultValues: {
      notification_type: notification_type as NotificationTemplate['notification_type'],
      notification_configuration: {},
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('NotifierFormInner (InnerForm)', () => {
  it('renders email form with Username label when notification_type is email', () => {
    render(
      <TestWrapper notification_type="email">
        <InnerForm notification_type="email" />
      </TestWrapper>
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('renders slack form with Token label when notification_type is slack', () => {
    render(
      <TestWrapper notification_type="slack">
        <InnerForm notification_type="slack" />
      </TestWrapper>
    );
    expect(screen.getByText('Token')).toBeInTheDocument();
  });

  it('renders twilio form with Account SID label when notification_type is twilio', () => {
    render(
      <TestWrapper notification_type="twilio">
        <InnerForm notification_type="twilio" />
      </TestWrapper>
    );
    expect(screen.getByText('Account SID')).toBeInTheDocument();
  });

  it('renders pagerduty form with Pagerduty subdomain label when notification_type is pagerduty', () => {
    render(
      <TestWrapper notification_type="pagerduty">
        <InnerForm notification_type="pagerduty" />
      </TestWrapper>
    );
    expect(screen.getByText('Pagerduty subdomain')).toBeInTheDocument();
  });

  it('renders grafana form with Grafana URL label when notification_type is grafana', () => {
    render(
      <TestWrapper notification_type="grafana">
        <InnerForm notification_type="grafana" />
      </TestWrapper>
    );
    expect(screen.getByText('Grafana URL')).toBeInTheDocument();
  });

  it('renders webhook form with Target URL label when notification_type is webhook', () => {
    render(
      <TestWrapper notification_type="webhook">
        <InnerForm notification_type="webhook" />
      </TestWrapper>
    );
    expect(screen.getByText('Target URL')).toBeInTheDocument();
  });

  it('renders mattermost form with Target URL label when notification_type is mattermost', () => {
    render(
      <TestWrapper notification_type="mattermost">
        <InnerForm notification_type="mattermost" />
      </TestWrapper>
    );
    expect(screen.getByText('Target URL')).toBeInTheDocument();
  });

  it('renders rocketchat form with Target URL label when notification_type is rocketchat', () => {
    render(
      <TestWrapper notification_type="rocketchat">
        <InnerForm notification_type="rocketchat" />
      </TestWrapper>
    );
    expect(screen.getByText('Target URL')).toBeInTheDocument();
  });

  it('renders irc form with IRC server password label when notification_type is irc', () => {
    render(
      <TestWrapper notification_type="irc">
        <InnerForm notification_type="irc" />
      </TestWrapper>
    );
    expect(screen.getByText('IRC server password')).toBeInTheDocument();
  });

  it('renders nothing for unknown notification_type', () => {
    render(
      <TestWrapper notification_type="unknown">
        <InnerForm notification_type="unknown" />
      </TestWrapper>
    );
    expect(screen.queryByText('Username')).not.toBeInTheDocument();
    expect(screen.queryByText('Token')).not.toBeInTheDocument();
  });

  it('validates email addresses, ports, and timeouts', async () => {
    const user = userEvent.setup();
    function EmailHarness() {
      const methods = useForm<NotificationTemplate>({
        mode: 'onChange',
        defaultValues: {
          notification_type: 'email',
          notification_configuration: {},
        },
      });
      return (
        <FormProvider {...methods}>
          <form
            onSubmit={(event) => {
              void methods.handleSubmit(() => undefined)(event);
            }}
          >
            <InnerForm notification_type="email" />
            <button type="submit">Save email</button>
          </form>
        </FormProvider>
      );
    }

    render(<EmailHarness />);
    await user.click(screen.getByTestId('notification-configuration-sender'));
    await user.paste('@example.com');
    await user.click(screen.getByTestId('notification-configuration-port'));
    await user.paste('0');
    await user.click(screen.getByTestId('notification-configuration-timeout'));
    await user.paste('500');
    await user.click(screen.getByRole('button', { name: 'Save email' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText(/between 1 and 65535/)).toBeInTheDocument();
    expect(screen.getByText(/between 1 and 120/)).toBeInTheDocument();

    await user.clear(screen.getByTestId('notification-configuration-sender'));
    await user.paste('ops@example.com');
    await user.clear(screen.getByTestId('notification-configuration-port'));
    await user.paste('25');
    await user.clear(screen.getByTestId('notification-configuration-timeout'));
    await user.paste('10');
    await user.click(screen.getByRole('button', { name: 'Save email' }));

    expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
  }, 15000);

  it('validates webhook and twilio values from the type-specific fields', async () => {
    const errors: Record<string, unknown> = {};
    function UrlHarness() {
      const methods = useForm<NotificationTemplate>({
        defaultValues: { notification_type: 'webhook', notification_configuration: {} },
      });
      return (
        <FormProvider {...methods}>
          <InnerForm notification_type="webhook" />
          <InnerForm notification_type="mattermost" />
          <InnerForm notification_type="rocketchat" />
          <InnerForm notification_type="irc" />
          <InnerForm notification_type="twilio" />
          <button
            type="button"
            onClick={() => {
              void (async () => {
                methods.setValue('notification_configuration.url', 'notaurl');
                methods.setValue(
                  'notification_configuration.mattermost_url',
                  'https://chat.example.com'
                );
                methods.setValue('notification_configuration.mattermost_icon_url', '');
                methods.setValue(
                  'notification_configuration.rocketchat_url',
                  'ftp://files.example.com'
                );
                methods.setValue(
                  'notification_configuration.rocketchat_icon_url',
                  'www.example.com/icon.png'
                );
                methods.setValue('notification_configuration.server', 'javascript:alert(1)');
                methods.setValue('notification_configuration.from_number', 'abc');
                methods.setValue('notification_configuration.to_numbers', '+18005550199\n\nbad');
                await methods.trigger();
                const urlState = methods.getFieldState('notification_configuration.url');
                const phoneState = methods.getFieldState('notification_configuration.from_number');
                errors.urlInvalid = urlState.invalid;
                errors.phoneInvalid = phoneState.invalid;
                errors.url = urlState.error?.message;
                errors.phone = phoneState.error?.message;
              })();
            }}
          >
            Check values
          </button>
        </FormProvider>
      );
    }

    const user = userEvent.setup();
    render(<UrlHarness />);
    await user.click(screen.getByRole('button', { name: 'Check values' }));
    await waitFor(() => {
      expect(errors.urlInvalid).toBe(true);
      expect(errors.phoneInvalid).toBe(true);
    });
  }, 15000);
});

describe('notifier field helpers', () => {
  it('returns help text for each notifier field and null for unknown fields', () => {
    expect(getLabelHelp('email', 'recipients', translate)).toContain('one email address');
    expect(getLabelHelp('email', 'timeout', translate)).toContain('120 seconds');
    expect(getLabelHelp('slack', 'hex_color', translate)).toContain('hex color code');
    expect(getLabelHelp('twilio', 'from_number', translate)).toContain('Messaging Service');
    expect(getLabelHelp('twilio', 'to_numbers', translate)).toContain('one phone number');
    expect(getLabelHelp('grafana', 'grafana_url', translate)).toContain('Grafana');
    expect(getLabelHelp('grafana', 'annotation_tags', translate)).toContain('annotation tag');
    expect(getLabelHelp('webhook', 'headers', translate)).toContain('HTTP Headers');
    expect(getLabelHelp('irc', 'targets', translate)).toContain('IRC channel');
    expect(getLabelHelp('email', 'missing', translate)).toBeNull();

    render(<>{getLabelHelp('slack', 'channels', translate)}</>);
    expect(screen.getByText(/One Slack channel per line/)).toBeInTheDocument();
  });

  it('accepts blank, valid, and invalid phone numbers', () => {
    expect(twilioPhoneNumber('', translate)).toBeUndefined();
    expect(twilioPhoneNumber('+18005550199', translate)).toBeUndefined();
    expect(twilioPhoneNumber('+18005550199\n\n+442012345678', translate)).toBeUndefined();
    expect(twilioPhoneNumber('abc', translate)).toBe('Please enter valid phone numbers.');
    expect(twilioPhoneNumber(undefined as unknown as string, translate)).toBeUndefined();
  });

  it('accepts http, https, ftp, and www urls and rejects everything else', () => {
    expect(validateUrl('', translate)).toBeUndefined();
    expect(validateUrl('https://example.com/hook', translate)).toBeUndefined();
    expect(validateUrl('http://example.com', translate)).toBeUndefined();
    expect(validateUrl('ftp://files.example.com/a', translate)).toBeUndefined();
    expect(validateUrl('www.example.com', translate)).toBeUndefined();
    expect(validateUrl('notaurl', translate)).toBe('Please enter a valid URL');
    expect(validateUrl('javascript:alert(1)', translate)).toBe('Please enter a valid URL');
  });
});
