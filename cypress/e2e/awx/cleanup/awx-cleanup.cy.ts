import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { User } from '../../../../frontend/awx/interfaces/User';
import { getJobsAPIUrl } from '../../../../frontend/awx/views/jobs/jobUtils';

const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

describe('AWX Cleanup', () => {
  it('cleanup projects', () => {
    cy.awxRequestGet<AwxItemsResponse<Project>>(
      `/api/v2/projects?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxProject(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup inventories', () => {
    cy.awxRequestGet<AwxItemsResponse<Inventory>>(
      `/api/v2/inventories?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxInventory(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup organizations', () => {
    cy.awxRequestGet<AwxItemsResponse<Organization>>(
      `/api/v2/organizations?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxOrganization(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup users', () => {
    cy.awxRequestGet<AwxItemsResponse<User>>(
      `/api/v2/users?username__startswith=e2e&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxUser(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup templates', () => {
    cy.awxRequestGet<AwxItemsResponse<JobTemplate>>(
      `/api/v2/unified_job_templates/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxJobTemplate(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup jobs', () => {
    cy.awxRequestGet<AwxItemsResponse<Job>>(
      `/api/v2/unified_jobs/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        const url = getJobsAPIUrl(resource.job_type ?? '');
        cy.awxRequestDelete(`${url}${resource.id}/`, { failOnStatusCode: false });
      }
    });
  });
});
