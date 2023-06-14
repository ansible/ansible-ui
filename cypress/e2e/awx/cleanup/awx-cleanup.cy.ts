import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { User } from '../../../../frontend/awx/interfaces/User';
import { getJobsAPIUrl } from '../../../../frontend/awx/views/jobs/jobUtils';
import { ItemsResponse } from '../../../../frontend/common/crud/Data';

const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

describe('AWX Cleanup', () => {
  it('cleanup projects', () => {
    cy.awxRequestGet<ItemsResponse<Project>>(
      `/api/v2/projects?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxProject(resource);
      }
    });
  });

  it('cleanup inventories', () => {
    cy.awxRequestGet<ItemsResponse<Inventory>>(
      `/api/v2/inventories?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxInventory(resource);
      }
    });
  });

  it('cleanup organizations', () => {
    cy.awxRequestGet<ItemsResponse<Organization>>(
      `/api/v2/organizations?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxOrganization(resource);
      }
    });
  });

  it('cleanup users', () => {
    cy.awxRequestGet<ItemsResponse<User>>(
      `/api/v2/users?username__startswith=e2e&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxUser(resource);
      }
    });
  });

  it('cleanup templates', () => {
    cy.awxRequestGet<ItemsResponse<JobTemplate>>(
      `/api/v2/unified_job_templates/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxJobTemplate(resource);
      }
    });
  });

  it('cleanup jobs', () => {
    cy.awxRequestGet<ItemsResponse<Job>>(
      `/api/v2/unified_jobs/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        const url = getJobsAPIUrl(resource.job_type ?? '');
        cy.awxRequestDelete(`${url}${resource.id}/`);
      }
    });
  });
});
