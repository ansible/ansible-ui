import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ActivityStreamIcon } from './ActivityStreamIcon';

describe('ActivityStreamIcon', () => {
  it('should render a button', () => {
    render(
      <MemoryRouter>
        <ActivityStreamIcon type="organization" />
      </MemoryRouter>
    );
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });
});
