import { describe, expect, it } from 'vitest';
import { buildProjectStatusCellProps } from './useProjectStatusColumn';

type ProjectLike = {
  status?: string;
  summary_fields?: {
    last_job?: { id?: number };
    current_job?: { id?: number };
    current_update?: { id?: number };
  };
  related?: { last_job?: string };
};

const mockGetPageUrl = (route: string, config: { params: Record<string, string | number> }) =>
  `/jobs/${config.params.id}`;

function createTestProject(overrides: Partial<ProjectLike> = {}): ProjectLike {
  return {
    status: 'successful',
    summary_fields: {},
    related: {},
    ...overrides,
  };
}

describe('buildProjectStatusCellProps', () => {
  it('uses current_job id when available', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 100 } },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('100');
  });

  it('falls back to last_job when current_job empty', () => {
    const project = createTestProject({
      summary_fields: { current_job: {}, last_job: { id: 200 } },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('200');
  });

  it('falls back to current_update when current_job and last_job empty', () => {
    const project = createTestProject({
      summary_fields: { current_job: {}, last_job: {}, current_update: { id: 300 } },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('300');
  });

  it('falls back to related.last_job URL when no summary fields', () => {
    const project = createTestProject({
      summary_fields: { current_job: {}, last_job: {}, current_update: {} },
      related: { last_job: '/api/v2/project_updates/400/' },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('400');
  });

  it('returns undefined to when no job available', () => {
    const project = createTestProject({
      summary_fields: {},
      related: {},
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toBeUndefined();
  });

  it('respects disableLinks option', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 500 } },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl, '', '', true);
    expect(statusCellProps.to).toBeUndefined();
    expect(statusCellProps.disableLinks).toBe(true);
  });

  it('shows tooltip when job available even with disableLinks', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 550 } },
    });
    const { tooltipContent } = buildProjectStatusCellProps(
      project,
      mockGetPageUrl,
      'Job available',
      'No job',
      true
    );
    expect(tooltipContent).toBe('Job available');
  });

  it('uses tooltip text when job available', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 600 } },
    });
    const { tooltipContent } = buildProjectStatusCellProps(
      project,
      mockGetPageUrl,
      'Job running',
      ''
    );
    expect(tooltipContent).toBe('Job running');
  });

  it('uses tooltipAlt text when no job available', () => {
    const project = createTestProject({
      summary_fields: {},
    });
    const { tooltipContent } = buildProjectStatusCellProps(
      project,
      mockGetPageUrl,
      'Job running',
      'No job'
    );
    expect(tooltipContent).toBe('No job');
  });

  it('prefers current_job over all fallbacks', () => {
    const project = createTestProject({
      summary_fields: {
        current_job: { id: 800 },
        last_job: { id: 801 },
        current_update: { id: 802 },
      },
      related: { last_job: '/api/v2/project_updates/803/' },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('800');
  });

  it('prefers last_job over current_update and URL', () => {
    const project = createTestProject({
      summary_fields: {
        current_job: {},
        last_job: { id: 900 },
        current_update: { id: 901 },
      },
      related: { last_job: '/api/v2/project_updates/902/' },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('900');
  });

  it('prefers current_update over URL', () => {
    const project = createTestProject({
      summary_fields: {
        current_job: {},
        last_job: {},
        current_update: { id: 1000 },
      },
      related: { last_job: '/api/v2/project_updates/1001/' },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('1000');
  });

  it('includes status from project', () => {
    const project = createTestProject({
      status: 'error',
      summary_fields: { current_job: { id: 100 } },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.status).toBe('error');
  });

  it('handles null/undefined summary_fields', () => {
    const project = createTestProject({
      summary_fields: undefined,
      related: { last_job: '/api/v2/project_updates/500/' },
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('500');
  });

  it('handles null/undefined related', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 600 } },
      related: undefined,
    });
    const { statusCellProps } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(statusCellProps.to).toContain('600');
  });

  it('defaults tooltip text to empty string', () => {
    const project = createTestProject({
      summary_fields: { current_job: { id: 700 } },
    });
    const { tooltipContent } = buildProjectStatusCellProps(project, mockGetPageUrl);
    expect(tooltipContent).toBe('');
  });

  it('returns empty tooltip when tooltip params empty and no job', () => {
    const project = createTestProject({
      summary_fields: {},
    });
    const { tooltipContent } = buildProjectStatusCellProps(project, mockGetPageUrl, '', '');
    expect(tooltipContent).toBe('');
  });
});
