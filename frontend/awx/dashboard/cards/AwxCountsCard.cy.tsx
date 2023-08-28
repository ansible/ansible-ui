import { IAwxDashboardData } from '../AwxDashboard';
import { AwxCountsCard } from './AwxCountsCard';

describe('TeamForm.cy.ts', () => {
  it('Create Team - Displays organization error message on internal server error', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      { statusCode: 500, message: 'Internal Server Error' }
    );
    const data: IAwxDashboardData = {
      inventories: {
        url: '',
        total: 0,
        total_with_inventory_source: 0,
        job_failed: 0,
        inventory_failed: 0,
      },
      inventory_sources: {
        ec2: { url: '', failures_url: '', label: '', total: 0, failed: 0 },
      },
      groups: { url: '', total: 0, inventory_failed: 0 },
      hosts: { url: '', failures_url: '', total: 0, failed: 0 },
      projects: { url: '', failures_url: '', total: 0, failed: 0 },
      scm_types: {
        git: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
        svn: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
        archive: { url: '', label: '', failures_url: '', total: 0, failed: 0 },
      },
      users: { url: '', total: 0 },
      organizations: { url: '', total: 0 },
      teams: { url: '', total: 0 },
      credentials: { url: '', total: 0 },
      job_templates: { url: '', total: 0 },
    };
    cy.mount(<AwxCountsCard data={data} />);
    cy.contains('Error loading organizations').should('be.visible');
  });
});
