/* eslint-disable i18next/no-literal-string */
import { render } from '@testing-library/react';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { describe, expect, it } from 'vitest';
import { IconWrapper } from './IconWrapper';

describe('IconWrapper', () => {
  it('clones child icons with color and padding props', () => {
    const { container } = render(
      <IconWrapper color="success" size="lg" padRight padLeft>
        <InfoCircleIcon data-testid="icon" />
      </IconWrapper>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.paddingRight).toBe('8px');
    expect(wrapper.style.paddingLeft).toBe('8px');
    expect(container.querySelector('[data-testid="icon"]')).toBeTruthy();
  });

  it('applies padding for each icon size', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;
    const padding: Record<string, string> = { sm: '6px', md: '6px', lg: '8px', xl: '12px' };

    for (const size of sizes) {
      const { container, unmount } = render(
        <IconWrapper size={size} padRight padLeft>
          <InfoCircleIcon />
        </IconWrapper>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.paddingRight).toBe(padding[size]);
      expect(wrapper.style.paddingLeft).toBe(padding[size]);
      unmount();
    }
  });
});
