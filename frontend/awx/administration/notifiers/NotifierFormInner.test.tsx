import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { InnerForm } from './NotifierFormInner';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';

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
});
