/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SignStatus } from './SignStatus';

describe('SignStatus', () => {
  it('renders signed status', () => {
    render(
      <MemoryRouter>
        <SignStatus state="signed" />
      </MemoryRouter>
    );
    expect(screen.getByText('Signed')).toBeInTheDocument();
  });

  it('renders unsigned status', () => {
    render(
      <MemoryRouter>
        <SignStatus state="unsigned" />
      </MemoryRouter>
    );
    expect(screen.getByText('Unsigned')).toBeInTheDocument();
  });

  it('renders nothing for undefined state', () => {
    const { container } = render(<SignStatus state={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
