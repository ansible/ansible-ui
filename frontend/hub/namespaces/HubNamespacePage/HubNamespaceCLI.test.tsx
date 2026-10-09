/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HubNamespaceCLI } from './HubNamespaceCLI';

vi.mock('../../common/api/hub-api-utils', () => ({
  getRepoURL: () => 'https://galaxy.example.com/api/galaxy/content/published/',
}));

describe('HubNamespaceCLI', () => {
  it('renders repository URL and documentation link', () => {
    render(<HubNamespaceCLI />);

    expect(
      screen.getByText('https://galaxy.example.com/api/galaxy/content/published/')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'here.' })).toHaveAttribute(
      'href',
      'https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#configuring-the-ansible-galaxy-client'
    );
  });
});
