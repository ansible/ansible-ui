import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CreateOrganization } from './OrganizationForm';

describe('OrganizationForm', () => {
  describe('CreateOrganization', () => {
    it('should render create organization page with title and Name field', async () => {
      render(
        <MemoryRouter>
          <CreateOrganization />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create organization');
      });

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
    });
  });
});
