import { IAwxDashboardData } from '../AwxOverview';
import { AwxCountsCard } from './AwxCountsCard';

describe('AwxCountsCard.cy.ts', () => {
  it('should render the counts card with the correct counts', () => {
    const data: IAwxDashboardData = {
      inventories: { total: 3, inventory_failed: 1 },
      hosts: { total: 20, failed: 9 },
      projects: { total: 7, failed: 4 },
    } as IAwxDashboardData;

    cy.mount(<AwxCountsCard data={data} />);

    cy.contains('Hosts')
      .parent()
      .within(() => {
        cy.contains(data.hosts.total - data.hosts.failed);
        cy.contains(data.hosts.failed);
      });

    cy.contains('Projects')
      .parent()
      .within(() => {
        cy.contains(data.projects.total - data.projects.failed)
          .parent()
          .contains('Ready');

        cy.contains(data.projects.failed).parent().contains('Failed');
      });

    cy.contains('Inventories')
      .parent()
      .within(() => {
        cy.contains(data.inventories.total - data.inventories.inventory_failed);
        cy.contains(data.inventories.inventory_failed);
      });
  });
});
