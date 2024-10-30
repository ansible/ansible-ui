import { awxAPI } from '../../common/api/awx-utils';
import { HostMetrics } from './HostMetrics';

describe('HostMetrics', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/host_metrics/*`,
      },
      {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            hostname: 'localhost',
            url: '/api/controller/v2/host_metrics/1/',
            first_automation: '2024-10-22T20:14:07.666023Z',
            last_automation: '2024-10-22T20:14:30.637962Z',
            last_deleted: null,
            automated_counter: 2,
            deleted_counter: 0,
            deleted: false,
            used_in_inventories: null,
          },
          {
            id: 2,
            hostname: 'demo-host',
            url: '/api/controller/v2/host_metrics/2/',
            first_automation: '2024-10-22T20:14:07.666105Z',
            last_automation: '2024-10-22T20:14:30.637962Z',
            last_deleted: null,
            automated_counter: 2,
            deleted_counter: 0,
            deleted: false,
            used_in_inventories: null,
          },
        ],
      }
    );
  });

  it('Filter by hostname contains lookup', () => {
    cy.intercept(awxAPI`/host_metrics/?not__deleted=true&hostname__icontains=demo*`).as(
      'hostnameContainsFilterRequest'
    );
    cy.mount(<HostMetrics />);
    cy.filterTableByTextFilter('hostname-contains', 'demo');
    cy.wait('@hostnameContainsFilterRequest');
    cy.clearAllFilters();
  });

  it('Filter by hostname iregex lookup', () => {
    cy.intercept(awxAPI`/host_metrics/?not__deleted=true&hostname__iregex=*`).as(
      'hostnameIregexFilterRequest'
    );
    cy.mount(<HostMetrics />);
    cy.filterTableByTextFilter('hostname-(iregex)', '^(?!local).');
    cy.wait('@hostnameIregexFilterRequest');
    cy.clearAllFilters();
  });
});
