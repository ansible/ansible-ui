import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { MilestoneBadgesCard } from './MilestoneBadgesCard';

describe('MilestoneBadgesCard', () => {
  test('should render both achievement shelves', () => {
    render(<MilestoneBadgesCard />);

    expect(screen.getByRole('heading', { name: '30-day achievements' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your achievements' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Your org's achievements" })).toBeInTheDocument();
  });

  test('should render every milestone and org badge', () => {
    render(<MilestoneBadgesCard />);

    [
      'Ignition',
      'Week Warrior',
      'Month Warrior',
      'Explorer',
      'Centurion',
      'Reliable',
      'Accelerator',
    ]
      .concat(['Sustained', 'Rising', 'Top Tier'])
      .forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
  });

  test('should mark earned badges as earned and the rest as locked', () => {
    render(<MilestoneBadgesCard />);

    expect(screen.getByLabelText('Ignition')).toHaveClass('achievement-badge--earned');
    expect(screen.getByLabelText('Explorer')).toHaveClass('achievement-badge--earned');
    expect(screen.getByLabelText('Reliable')).toHaveClass('achievement-badge--locked');
    expect(screen.getByLabelText('Sustained')).toHaveClass('achievement-badge--earned');
    expect(screen.getByLabelText('Top Tier')).toHaveClass('achievement-badge--locked');
  });

  test('should list earned badges before locked ones within a shelf', () => {
    const { container } = render(<MilestoneBadgesCard />);

    const [milestoneGrid] = container.getElementsByClassName('achievement-badges-grid--milestone');
    const labels = within(milestoneGrid as HTMLElement)
      .getAllByText(/.+/, { selector: '.achievement-badge__label' })
      .map((node) => node.textContent);

    expect(labels.slice(0, 4)).toEqual(['Ignition', 'Week Warrior', 'Explorer', 'Centurion']);
  });
});
