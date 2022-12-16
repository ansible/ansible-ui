/// <reference types="jest" />

import { render, screen, waitFor } from '@testing-library/react';
import Jobs from './Jobs';

describe('Jobs list', () => {
  test('Component renders', async () => {
    render(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('Jobs')).toBeTruthy();
    });
  });
});
