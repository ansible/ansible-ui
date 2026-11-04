import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { Domains } from './Domains';
import { getTranslatedDomains, useDomainsStore } from './useDomains';

describe('Domains', () => {
  beforeEach(() => {
    useDomainsStore.setState({
      domains: getTranslatedDomains(),
      activeDomains: [],
    });
  });

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

  test('should toggle active domain and clear selection', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    const toggleButton = screen
      .getAllByRole('button')
      .find((button) => button.getAttribute('aria-pressed') !== null);
    expect(toggleButton).toBeDefined();
    await user.click(toggleButton as HTMLButtonElement);
    expect(useDomainsStore.getState().activeDomains).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Clear Active Domains' }));
    expect(useDomainsStore.getState().activeDomains).toHaveLength(0);
  });

  test('should open configure domains modal', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Configure Domains/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Configure domains for filtering the views.')).toBeInTheDocument();
  });

  test('should save domains and close configure modal on submit', async () => {
    const user = userEvent.setup();
    const customDomains = [{ name: 'Ops', labels: [{ name: 'ops' }] }];
    useDomainsStore.setState({ domains: customDomains, activeDomains: [] });

    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Configure Domains/i }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(useDomainsStore.getState().domains).toEqual(customDomains);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should close configure modal on cancel', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Configure Domains/i }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should reject duplicate domain names on submit', async () => {
    const user = userEvent.setup();
    useDomainsStore.setState({
      domains: [
        { name: 'Ops', labels: [] },
        { name: 'Ops', labels: [] },
      ],
      activeDomains: [],
    });

    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Configure Domains/i }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(screen.getByText('Each domain name must be unique.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('should add and remove a domain in configure modal', async () => {
    const user = userEvent.setup();
    useDomainsStore.setState({
      domains: [
        { name: 'Alpha', labels: [{ name: 'a' }] },
        { name: 'Beta', labels: [{ name: 'b' }] },
      ],
      activeDomains: [],
    });

    render(
      <MemoryRouter>
        <Domains />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /Configure Domains/i }));
    await user.click(screen.getByRole('button', { name: 'Add Domain' }));
    await user.click(screen.getAllByRole('button', { name: 'Remove' })[0]);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(useDomainsStore.getState().domains).toHaveLength(1);
  });
});
