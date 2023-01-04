import { useJobsFilters } from './useJobsFilters';
import { renderHook } from '@testing-library/react-hooks/native';

describe('useJobsFilters', () => {
  it('Returns expected number of filters', () => {
    // eslint-disable-next-line
    const { result } = renderHook(() => useJobsFilters());
    // eslint-disable-next-line
    expect(result.current.length).toEqual(7);
  });
});
