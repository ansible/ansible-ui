import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { NotificationTemplate } from '../../interfaces/NotificationTemplate';
import { areMessagesEmpty, MessagesType, NotifierFormMessages } from './NotifierFormMessages';

const savedMessages: MessagesType = {
  error: { message: 'saved error', body: 'saved error body' },
  started: { message: 'saved start', body: 'saved start body' },
  success: { message: 'saved success', body: 'saved success body' },
  workflow_approval: {
    approved: { message: 'saved approved', body: 'saved approved body' },
    denied: { message: 'saved denied', body: 'saved denied body' },
    running: { message: 'saved running', body: 'saved running body' },
    timed_out: { message: 'saved timed out', body: 'saved timed out body' },
  },
};

function TestWrapper({
  children,
  notification_type,
  messages,
}: {
  children: React.ReactNode;
  notification_type: string;
  messages?: MessagesType;
}) {
  const methods = useForm<NotificationTemplate>({
    defaultValues: {
      notification_type: notification_type as NotificationTemplate['notification_type'],
      messages,
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

  it('renders webhook body fields when notification_type is webhook', () => {
    render(
      <TestWrapper notification_type="webhook">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Error message body')).toBeInTheDocument();
    expect(screen.queryByText('Start message')).not.toBeInTheDocument();
  });

  it('renders Workflow approved message label when customize_messages is true', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Workflow approved message')).toBeInTheDocument();
  });

  it('renders Error message label for email notifiers when customizing messages', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('copies saved email messages into empty form fields', () => {
    render(
      <TestWrapper notification_type="email">
        <NotifierFormMessages
          customize_messages={true}
          data={{ messages: savedMessages } as NotificationTemplate}
        />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue('saved start')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved start body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved success')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved success body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved error')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved error body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved approved')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved approved body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved denied')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved denied body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved running')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved running body')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved timed out')).toBeInTheDocument();
    expect(screen.getByDisplayValue('saved timed out body')).toBeInTheDocument();
  });

  it('keeps form message values when they are already set', () => {
    render(
      <TestWrapper notification_type="pagerduty" messages={savedMessages}>
        <NotifierFormMessages
          customize_messages={true}
          data={
            {
              messages: {
                ...savedMessages,
                error: { message: 'from data', body: 'from data body' },
              },
            } as NotificationTemplate
          }
        />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue('saved error')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('from data')).not.toBeInTheDocument();
    expect(screen.getByText('Workflow timed out message body')).toBeInTheDocument();
  });

  it('renders only webhook bodies from saved messages', () => {
    render(
      <TestWrapper notification_type="webhook">
        <NotifierFormMessages
          customize_messages={true}
          data={{ messages: savedMessages } as NotificationTemplate}
        />
      </TestWrapper>
    );
    expect(screen.getByDisplayValue('saved error body')).toBeInTheDocument();
    expect(screen.queryByText('Start message')).not.toBeInTheDocument();
    expect(screen.getByText('Workflow pending message body')).toBeInTheDocument();
  });

  it('renders message fields without bodies for slack and irc', () => {
    const { rerender } = render(
      <TestWrapper notification_type="irc">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('Start message')).toBeInTheDocument();
    expect(screen.queryByText('Start message body')).not.toBeInTheDocument();

    rerender(
      <TestWrapper notification_type="grafana">
        <NotifierFormMessages customize_messages={true} data={undefined} />
      </TestWrapper>
    );
    expect(screen.getByText('success message')).toBeInTheDocument();
    expect(screen.queryByText('success message body')).not.toBeInTheDocument();
  });
});

describe('areMessagesEmpty', () => {
  it('returns true when messages are missing', () => {
    expect(areMessagesEmpty({} as NotificationTemplate)).toBe(true);
    expect(areMessagesEmpty({ messages: null } as NotificationTemplate)).toBe(true);
    expect(
      areMessagesEmpty({
        messages: {
          error: {},
          started: {},
          success: {},
          workflow_approval: { approved: {}, denied: {}, running: {}, timed_out: {} },
        },
      } as NotificationTemplate)
    ).toBe(true);
  });

  it.each([
    ['error message', { error: { message: 'x' } }],
    ['error body', { error: { body: 'x' } }],
    ['started message', { started: { message: 'x' } }],
    ['started body', { started: { body: 'x' } }],
    ['success message', { success: { message: 'x' } }],
    ['success body', { success: { body: 'x' } }],
    ['approved message', { workflow_approval: { approved: { message: 'x' } } }],
    ['approved body', { workflow_approval: { approved: { body: 'x' } } }],
    ['denied message', { workflow_approval: { denied: { message: 'x' } } }],
    ['denied body', { workflow_approval: { denied: { body: 'x' } } }],
    ['running message', { workflow_approval: { running: { message: 'x' } } }],
    ['running body', { workflow_approval: { running: { body: 'x' } } }],
    ['timed out message', { workflow_approval: { timed_out: { message: 'x' } } }],
    ['timed out body', { workflow_approval: { timed_out: { body: 'x' } } }],
  ])('returns false when %s is set', (_label, messages) => {
    expect(areMessagesEmpty({ messages } as NotificationTemplate)).toBe(false);
  });
});
