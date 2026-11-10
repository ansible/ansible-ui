/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { StandardPopover } from './StandardPopover';

describe('StandardPopover', () => {
  it('returns null when content is empty', () => {
    const { container } = render(<StandardPopover header="Header" content={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows header and body after opening', async () => {
    const user = userEvent.setup();
    render(
      <StandardPopover
        id="help-popover"
        header="Help title"
        content="Help body"
        ariaLabel="More information"
      />
    );

    await user.click(screen.getByRole('button', { name: 'More information' }));
    expect(screen.getByText('Help title')).toBeInTheDocument();
    expect(screen.getByText('Help body')).toBeInTheDocument();
  });
});
