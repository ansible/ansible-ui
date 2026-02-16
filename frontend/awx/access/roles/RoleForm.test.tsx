import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { CreateRole } from './RoleForm';

describe('RoleForm', () => {
  describe('CreateRole', () => {
    it('should render create role page with title', () => {
      render(
        <MemoryRouter initialEntries={['/roles/create']}>
          <Routes>
            <Route path="/roles/create" element={<CreateRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('page-title')).toHaveTextContent('Create role');
    });

    it('should render Name form field', () => {
      render(
        <MemoryRouter initialEntries={['/roles/create']}>
          <Routes>
            <Route path="/roles/create" element={<CreateRole />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByTestId('name-form-group')).toBeInTheDocument();
    });
  });
});
