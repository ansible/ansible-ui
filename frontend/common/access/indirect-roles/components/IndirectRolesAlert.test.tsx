/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IndirectRolesAlert } from './IndirectRolesAlert';

describe('IndirectRolesAlert', () => {
  it('should render the alert with title and description', () => {
    render(
      <IndirectRolesAlert
        title="Indirect roles title"
        description="Indirect roles description"
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText('Indirect roles title')).toBeInTheDocument();
    expect(screen.getByText('Indirect roles description')).toBeInTheDocument();
  });

  it('should render default action link text', () => {
    render(<IndirectRolesAlert title="Title" description="Description" onOpen={vi.fn()} />);

    expect(screen.getByText('View indirectly assigned roles')).toBeInTheDocument();
  });

  it('should render custom action link text', () => {
    render(
      <IndirectRolesAlert
        title="Title"
        description="Description"
        actionLabel="Custom action"
        onOpen={vi.fn()}
      />
    );

    expect(screen.getByText('Custom action')).toBeInTheDocument();
  });

  it('should call onOpen when action link is clicked', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();

    render(<IndirectRolesAlert title="Title" description="Description" onOpen={onOpen} />);

    await user.click(screen.getByText('View indirectly assigned roles'));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should render as an info alert', () => {
    render(<IndirectRolesAlert title="Title" description="Description" onOpen={vi.fn()} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('should render without description content when description is empty', () => {
    render(<IndirectRolesAlert title="Title" description="" onOpen={vi.fn()} />);

    expect(screen.getByText('Title')).toBeInTheDocument();
  });
});
