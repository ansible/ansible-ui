import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { NotifierFormMessages } from './NotifierFormMessages';

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
      messages: undefined,
    },
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('NotifierFormMessages', () => {
  it('returns nothing when customize_messages is false', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={false} data={undefined} />
      </TestWrapper>
    );
    expect(screen.queryByText('Start message')).not.toBeInTheDocument();
  });

  it('renders Start message label when customize_messages is true and notification_type is email', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Start message')).toBeInTheDocument();
  });

  it('renders success message label when customize_messages is true and notification_type is slack', () => {
    render(
      <TestWrapper notification_type="slack">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('success message')).toBeInTheDocument();
  });

  it('renders Error message label when customize_messages is true and notification_type is pagerduty', () => {
    render(
      <TestWrapper notification_type="pagerduty">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders Start message body label when notification_type supports body (email)', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Start message body')).toBeInTheDocument();
  });

  it('renders Workflow approved message label when customize_messages is true', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Workflow approved message')).toBeInTheDocument();
  });
});
