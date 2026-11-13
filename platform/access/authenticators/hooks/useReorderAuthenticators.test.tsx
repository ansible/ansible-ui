import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Authenticator, AuthenticatorTypeEnum } from '../../../interfaces/Authenticator';
import { ReorderItemsModal } from './useReorderAuthenticators';

const mockSetDialog = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageDialog: () => [undefined, mockSetDialog],
  };
});

const authA: Authenticator = {
  id: 1,
  name: 'Alpha',
  auto_migrate_users_to: null,
  url: '',
  created: '',
  modified: '',
  related: {},
  enabled: true,
  create_objects: false,
  remove_users: false,
  configuration: {},
  type: AuthenticatorTypeEnum.LDAP,
  order: 1,
  slug: 'alpha',
  summary_fields: {
    auto_migrate_users_to: { name: '', id: 0 },
    created_by: {} as Authenticator['summary_fields']['created_by'],
    modified_by: {} as Authenticator['summary_fields']['modified_by'],
  },
};

const authB: Authenticator = { ...authA, id: 2, name: 'Beta', order: 2, slug: 'beta' };

describe('ReorderItemsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authenticator names and calls onApplyChanges when Apply is clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const onApplyChanges = vi.fn();

    render(
      <ReorderItemsModal
        items={[authA, authB]}
        onApplyChanges={onApplyChanges}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('Manage authentication order')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onApplyChanges).toHaveBeenCalledWith([authA, authB]);
    expect(mockSetDialog).toHaveBeenCalledWith(undefined);
  });

  it('closes the modal when Cancel is clicked', async () => {
    const user = userEvent.setup({ delay: null });

    render(<ReorderItemsModal items={[authA]} onApplyChanges={vi.fn()} onComplete={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockSetDialog).toHaveBeenCalledWith(undefined);
  });
});
