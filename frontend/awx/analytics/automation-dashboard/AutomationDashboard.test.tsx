import { vi, test, afterEach, describe, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AutomationDashboard } from './AutomationDashboard';
import { MemoryRouter } from 'react-router-dom';

function testWrapper() {
  return (
    <MemoryRouter>
      <AutomationDashboard></AutomationDashboard>
    </MemoryRouter>
  );
}

describe('AutomationDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders AutomationDashboard component', () => {
    render(testWrapper());
  });

  test('renders dashboard title', () => {
    const { getByText } = render(testWrapper());
    expect(getByText('Automation Dashboard')).toBeInTheDocument();
  });

  test.each([
    { label: 'Successful jobs' },
    { label: 'Failed jobs' },
    { label: 'Hosts automated' },
    { label: 'Hours of automation' },
  ])('render dashboard value card $label', ({ label }) => {
    const { getByText } = render(testWrapper());
    expect(getByText(label)).toBeInTheDocument();
  });

  test.each([{ title: 'Top 5 projects' }, { title: 'Top 5 users' }])(
    'renders dashboard table card $title',
    ({ title }) => {
      const { getByText } = render(testWrapper());
      expect(getByText(title)).toBeInTheDocument();
    }
  );

  test.each([
    { title: 'Number of hosts jobs are running on' },
    { title: 'Number of times jobs were run' },
  ])('renders dashboard chart card $title', ({ title }) => {
    const { getByText } = render(testWrapper());
    expect(getByText(title)).toBeInTheDocument();
  });

  test.each([
    { title: 'Cost of manual automation' },
    { title: 'Cost of automated execution' },
    { title: 'Total savings/cost avoided' },
    { title: 'Total hours saved/avoided' },
    { title: 'Hourly rate for manually running the job' },
    { title: 'Monthly AAP cost' },
    { title: 'Include time taken to create automation into calculation' },
    { title: 'Template Name' },
    { title: 'Number of job executions' },
    { title: 'Time taken to manually execute (min)' },
    { title: 'Time taken to create automation (min)' },
    { title: 'Running time' },
    { title: 'Automated cost' },
    { title: 'Manual cost' },
    { title: 'Savings' },
    { title: 'Export as CSV' },
  ])('renders dashboard main table card component $title', ({ title }) => {
    const { getByText } = render(testWrapper());
    expect(getByText(title)).toBeInTheDocument();
  });
});
