/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ConstructedInventoryHint } from './ConstructedInventoryHint';

vi.mock('../../../common/useAwxConfig', () => ({
  useAwxConfig: () => ({}),
}));

vi.mock('@ansible/common-ui/utils/useGetDocsUrl', () => ({
  useGetDocsUrl: () => 'https://docs.example.com/constructed',
}));

describe('ConstructedInventoryHint', () => {
  test('should render hint title', () => {
    render(<ConstructedInventoryHint />);

    expect(screen.getByText(/How to use the constructed inventory plugin/i)).toBeInTheDocument();
  });

  test('should render documentation link', () => {
    render(<ConstructedInventoryHint />);

    expect(screen.getByText(/View constructed inventory documentation here/i)).toBeInTheDocument();
  });

  test('should render constructed inventory parameters table when expanded', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    render(<ConstructedInventoryHint />);

    const expandButton = screen.getByRole('button', {
      name: /Info alert details/i,
    });
    await user.click(expandButton);

    expect(screen.getByText(/Parameter/)).toBeInTheDocument();
    expect(screen.getByText(/Description/)).toBeInTheDocument();
  });
});
