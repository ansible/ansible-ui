import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LabelGroupWrapper } from './label-group-wrapper';

describe('LabelGroupWrapper', () => {
  it('should override toggleCollapse to prevent default form submission', () => {
    const preventDefault = vi.fn();
    const setState = vi.fn();
    const wrapper = new LabelGroupWrapper({ children: null });
    wrapper.setState = setState;
    Object.assign(wrapper, {
      headingRef: { current: { offsetWidth: 10, scrollWidth: 20 } },
    });

    wrapper.toggleCollapse({
      preventDefault,
    } as unknown as MouseEvent<HTMLButtonElement>);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(setState).toHaveBeenCalledTimes(1);
  });
});
