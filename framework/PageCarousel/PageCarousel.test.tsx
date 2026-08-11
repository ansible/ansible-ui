/* eslint-disable i18next/no-literal-string */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageCarousel, useCarouselContext } from './PageCarousel';

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn(),
}));

function ContextReader() {
  const { width, visibleCards } = useCarouselContext();
  return (
    <div data-testid="context">
      {width}-{visibleCards}
    </div>
  );
}

describe('PageCarousel', () => {
  it('should render children', () => {
    render(
      <PageCarousel carouselId="test">
        <div>Card 1</div>
        <div>Card 2</div>
        <div>Card 3</div>
      </PageCarousel>
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('should provide carousel context', () => {
    render(
      <PageCarousel carouselId="ctx-test">
        <ContextReader />
      </PageCarousel>
    );

    expect(screen.getByTestId('context')).toBeInTheDocument();
  });

  it('should render slide container with correct id', () => {
    const { container } = render(
      <PageCarousel carouselId="my-carousel">
        <div>Card</div>
      </PageCarousel>
    );

    expect(container.querySelector('#slide-container-my-carousel')).toBeInTheDocument();
  });
});
