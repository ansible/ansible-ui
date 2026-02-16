import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { Domains } from './Domains';

describe('Domains', () => {
  test('should render Domains label', () => {
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    expect(screen.getByText('Domains')).toBeInTheDocument();
  });

  test('should render Configure Domains button', () => {
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    const configureButton = screen.getByRole('button', {
      name: /Configure Domains/i,
    });
    expect(configureButton).toBeInTheDocument();
  });
});
