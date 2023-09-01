import { RouteObj } from '../../../common/Routes';
import { IAwxDashboardData } from '../AwxDashboard';
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
        cy.contains(data.hosts.total).should('have.attr', 'href', RouteObj.Hosts);
        cy.contains(data.hosts.total - data.hosts.failed);
        cy.contains(data.hosts.failed);
      });

    cy.contains('Projects')
      .parent()
      .within(() => {
        cy.contains(data.projects.total).should('have.attr', 'href', RouteObj.Projects);

        cy.contains(data.projects.total - data.projects.failed)
          .parent()
          .contains('Ready')
          .should('have.attr', 'href', RouteObj.Projects + '?status=successful');

        cy.contains(data.projects.failed)
          .parent()
          .contains('Failed')
          .should('have.attr', 'href', RouteObj.Projects + '?status=failed,error,canceled,missing');
      });

    cy.contains('Inventories')
      .parent()
      .within(() => {
        cy.contains(data.inventories.total).should('have.attr', 'href', RouteObj.Inventories);
        cy.contains(data.inventories.total - data.inventories.inventory_failed);
        cy.contains(data.inventories.inventory_failed);
      });
  });
});
