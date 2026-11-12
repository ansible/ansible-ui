import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { Application } from '@ansible/awx-ui/interfaces/Application';
import { OAuthApplicationSecretModal } from './OAuthApplicationSecretModal';

describe('OAuthApplicationSecretModal', () => {
  test('shows client id and secret for confidential app', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const app: Application = {
      id: 1,
      name: 'Secret App',
      url: '',
      client_id: 'cid-1',
      client_secret: 's3cret',
      client_type: 'confidential',
      organization: 1,
      type: 'o_auth2_application',
      created: '',
      modified: '',
      summary_fields: {
        user_capabilities: { edit: true, delete: true },
        organization: { id: 1, name: 'O', description: '' },
      },
    };

    render(<OAuthApplicationSecretModal onClose={onClose} applicationModalSource={app} />);

    const dialog = screen.getByRole('dialog', { name: 'OAuth Application Secrets' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Secret App')).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue('cid-1')).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue('s3cret')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  test('renders public application without surfacing a client secret value', () => {
    const app: Application = {
      id: 2,
      name: 'Public App',
      url: '',
      client_id: 'cid-2',
      client_type: 'public',
      organization: 1,
      type: 'o_auth2_application',
      created: '',
      modified: '',
      summary_fields: {
        user_capabilities: { edit: true, delete: true },
        organization: { id: 1, name: 'O', description: '' },
      },
    };

    render(<OAuthApplicationSecretModal onClose={vi.fn()} applicationModalSource={app} />);

    expect(screen.getByText('Public App')).toBeInTheDocument();
    expect(screen.queryByText('s3cret')).not.toBeInTheDocument();
  });
});
