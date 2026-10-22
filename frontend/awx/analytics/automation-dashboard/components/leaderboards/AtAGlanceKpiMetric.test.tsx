import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SyncAltIcon } from '@patternfly/react-icons';
import { AtAGlanceKpiMetric } from './AtAGlanceKpiMetric';

describe('AtAGlanceKpiMetric', () => {
  test('should render the title, dimension label and value', () => {
    render(
      <AtAGlanceKpiMetric
        title="Jobs run"
        dimensionIcon={<SyncAltIcon />}
        dimensionLabel="Velocity"
        value="1,234"
      />
    );

    expect(screen.getByRole('heading', { name: 'Jobs run' })).toBeInTheDocument();
    expect(screen.getByText('Velocity')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  test('should render a visible description and a caption when provided', () => {
    render(
      <AtAGlanceKpiMetric
        title="Featured template"
        dimensionIcon={<SyncAltIcon />}
        dimensionLabel="Usage"
        description="Most-used template"
        value="3,558 runs"
        caption={<span>Infrastructure provisioning</span>}
      />
    );

    expect(screen.getByText('Most-used template')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure provisioning')).toBeInTheDocument();
  });

  test('should render a custom value element instead of the default value', () => {
    render(
      <AtAGlanceKpiMetric
        title="Active organizations"
        dimensionIcon={<SyncAltIcon />}
        dimensionLabel="Reach"
        value="56"
        valueElement={<a href="/organizations">56 orgs</a>}
      />
    );

    expect(screen.getByRole('link', { name: '56 orgs' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '56' })).not.toBeInTheDocument();
  });
});
