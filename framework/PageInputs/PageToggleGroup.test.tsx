import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PageToggleGroup } from './PageToggleGroup';

describe('PageToggleGroup', () => {
  it('selects the first option when the current value is unavailable', async () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();

    render(
      <PageToggleGroup
        value="missing"
        onSelect={onSelect}
        options={[{ label: 'First', value: 'first' }]}
      />
    );

    await vi.runAllTimersAsync();
    expect(onSelect).toHaveBeenCalledWith('first');
    vi.useRealTimers();
  });
});
