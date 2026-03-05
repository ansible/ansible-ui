import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AwxPageForm } from './AwxPageForm';

describe('AwxPageForm', () => {
  it('should render with minimal props', () => {
    render(
      <AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}}>
        <div data-testid="child-content" />
      </AwxPageForm>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render submit button with provided text', () => {
    render(<AwxPageForm submitText="Submit Form" onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Submit Form' })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(<AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => {});

    render(<AwxPageForm submitText="Save" onSubmit={onSubmit} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<AwxPageForm submitText="Save" onSubmit={async () => {}} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });
});
