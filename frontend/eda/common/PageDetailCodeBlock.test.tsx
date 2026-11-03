import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const writeToClipboard = vi.fn();

vi.mock('@ansible/ansible-ui-framework/hooks/useClipboard', () => ({
  useClipboard: () => ({ copySuccess: true, writeToClipboard }),
}));

import { PageDetailCodeBlock } from './PageDetailCodeBlock';

describe('PageDetailCodeBlock', () => {
  it('should render the value and copy it to the clipboard', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PageDetailCodeBlock label="Headers" value='{"ok": true}' helpText="HTTP headers" />
      </MemoryRouter>
    );

    expect(screen.getByText('Headers')).toBeInTheDocument();
    expect(screen.getByTestId('code-block-value')).toHaveTextContent('{"ok": true}');

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));
    expect(writeToClipboard).toHaveBeenCalledWith('{"ok": true}');
  });

  it('should hide the copy action when showCopyToClipboard is false', () => {
    render(
      <MemoryRouter>
        <PageDetailCodeBlock value="secret" showCopyToClipboard={false} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('code-block-value')).toHaveTextContent('secret');
    expect(screen.queryByRole('button', { name: 'Copy to clipboard' })).not.toBeInTheDocument();
  });
});
