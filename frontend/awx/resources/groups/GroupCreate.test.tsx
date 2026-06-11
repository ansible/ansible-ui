import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GroupCreate } from './GroupCreate';

vi.mock('@ansible/common-ui/crud/usePostRequest', () => ({
  usePostRequest: vi.fn(() => vi.fn()),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useParams: vi.fn(() => ({ id: '1', inventory_type: 'inventory' })),
}));

interface MockFormInputProps {
  name: string;
  label: string;
  isRequired?: boolean;
  placeholder?: string;
}

interface MockFormSectionProps {
  children: React.ReactNode;
}

interface MockPageFormProps {
  children: React.ReactNode;
  onCancel: () => void;
}

vi.mock('@ansible/ansible-ui-framework', () => ({
  usePageNavigate: vi.fn(() => vi.fn()),
  PageFormTextInput: ({ name, label, isRequired, placeholder }: MockFormInputProps) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required={isRequired}
        data-testid={name}
      />
    </div>
  ),
  PageFormTextArea: ({ name, label, placeholder }: MockFormInputProps) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} placeholder={placeholder} data-testid={name} />
    </div>
  ),
  PageFormDataEditor: ({ name, label }: MockFormInputProps) => (
    <div>
      <label htmlFor={name}>{label}</label>
      <textarea id={name} name={name} data-testid={name} />
    </div>
  ),
  PageFormSection: ({ children }: MockFormSectionProps) => <div>{children}</div>,
  PageFormSubmitHandler: vi.fn(),
}));

vi.mock('../../common/AwxPageForm', () => {
  const createGroupLabel = 'Create group';
  const cancelLabel = 'Cancel';
  return {
    AwxPageForm: ({ children, onCancel }: MockPageFormProps) => (
      <form data-testid="group-form">
        {children}
        <button type="submit">{createGroupLabel}</button>
        <button type="button" onClick={onCancel}>
          {cancelLabel}
        </button>
      </form>
    ),
  };
});

describe('GroupCreate Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with all required fields', () => {
    render(<GroupCreate />);

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Variables')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create group/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('name field is marked as required', () => {
    render(<GroupCreate />);

    const nameInput = screen.getByTestId('name');
    expect(nameInput).toHaveAttribute('required');
  });

  it('has placeholder text for name field', () => {
    render(<GroupCreate />);

    const nameInput = screen.getByPlaceholderText('Enter name');
    expect(nameInput).toBeInTheDocument();
  });

  it('has placeholder text for description field', () => {
    render(<GroupCreate />);

    const descriptionInput = screen.getByPlaceholderText('Enter description');
    expect(descriptionInput).toBeInTheDocument();
  });

  it('allows typing in name field', async () => {
    const user = userEvent.setup();
    render(<GroupCreate />);

    const nameInput = screen.getByTestId('name');
    await user.type(nameInput, 'Test Group');

    expect(nameInput).toHaveValue('Test Group');
  });

  it('allows typing in description field', async () => {
    const user = userEvent.setup();
    render(<GroupCreate />);

    const descriptionInput = screen.getByTestId('description');
    await user.type(descriptionInput, 'Test Description');

    expect(descriptionInput).toHaveValue('Test Description');
  });
});
