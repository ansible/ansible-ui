import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { testFixture as jobFixture } from '../jobDetails.fixture';
import { JobOutputEvents } from './JobOutputEvents';

vi.mock('@react-hook/resize-observer', () => ({
  default: vi.fn(),
}));

vi.mock('./useJobOutput', () => ({
  useJobOutput: vi.fn(() => ({
    jobEventCount: 0,
    getJobOutputEvent: vi.fn(),
    queryJobOutputEvent: vi.fn(),
    jobEvents: {},
  })),
}));

vi.mock('./useJobOutputChildrenSummary', () => ({
  useJobOutputChildrenSummary: vi.fn(() => ({
    childrenSummary: undefined,
    isFlatMode: true,
  })),
}));

describe('JobOutputEvents', () => {
  it('should render with scroll controls wired to virtualized list', () => {
    render(
      <JobOutputEvents
        job={jobFixture}
        reloadJob={vi.fn()}
        toolbarFilters={[]}
        filterState={{}}
        isFollowModeEnabled={false}
        setIsFollowModeEnabled={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Scroll first' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Scroll last' })).toBeInTheDocument();
  });
});
