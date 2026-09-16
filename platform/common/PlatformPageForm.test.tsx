import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlatformPageForm } from './PlatformPageForm';

describe('PlatformPageForm', () => {
  it('should render with minimal props', () => {
    render(
      <PlatformPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}}>
        <div data-testid="child-content" />
      </PlatformPageForm>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render submit button with provided text', () => {
    render(
      <PlatformPageForm submitText="Submit Form" onSubmit={async () => {}} onCancel={() => {}} />
    );

    expect(screen.getByRole('button', { name: 'Submit Form' })).toBeInTheDocument();
  });

  it('should render cancel button', () => {
    render(<PlatformPageForm submitText="Save" onSubmit={async () => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => {});

    render(<PlatformPageForm submitText="Save" onSubmit={onSubmit} onCancel={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<PlatformPageForm submitText="Save" onSubmit={async () => {}} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should accept a custom errorAdapter prop', () => {
    const customErrorAdapter = vi.fn(() => ({ genericErrors: [], fieldErrors: [] }));

    render(
      <PlatformPageForm
        submitText="Save"
        onSubmit={async () => {}}
        onCancel={() => {}}
        errorAdapter={customErrorAdapter}
      >
        <div data-testid="custom-adapter-child" />
      </PlatformPageForm>
    );

    expect(screen.getByTestId('custom-adapter-child')).toBeInTheDocument();
  });
});
