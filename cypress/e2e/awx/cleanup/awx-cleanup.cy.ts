import { AwxItemsResponse } from '@ansible/awx-ui/common/AwxItemsResponse';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { Job } from '@ansible/awx-ui/interfaces/Job';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { AwxUser } from '@ansible/awx-ui/interfaces/User';
import { WorkflowApproval } from '@ansible/awx-ui/interfaces/WorkflowApproval';
import { getJobsAPIUrl } from '@ansible/awx-ui/views/jobs/jobUtils';
import { awxAPI } from '../../../support/formatApiPathForAwx';

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

describe('AWX Cleanup', () => {
  it('cleanup projects', () => {
    cy.requestGet<AwxItemsResponse<Project>>(
      awxAPI`/projects?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxProject(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup inventories', () => {
    cy.requestGet<AwxItemsResponse<Inventory>>(
      awxAPI`/inventories?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxInventory(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup organizations', () => {
    cy.requestGet<AwxItemsResponse<Organization>>(
      awxAPI`/organizations?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxOrganization(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup users', () => {
    cy.requestGet<AwxItemsResponse<AwxUser>>(
      awxAPI`/users?username__startswith=e2e-&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxUser(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup templates', () => {
    cy.requestGet<AwxItemsResponse<JobTemplate>>(
      awxAPI`/unified_job_templates/?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.deleteAwxJobTemplate(resource, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup jobs', () => {
    cy.requestGet<AwxItemsResponse<Job>>(
      awxAPI`/unified_jobs/?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        const url = getJobsAPIUrl(resource.job_type ?? '');
        cy.requestDelete(`${url}${resource.id}/`, { failOnStatusCode: false });
      }
    });
  });

  it('cleanup instance groups', () => {
    cy.requestGet<AwxItemsResponse<Job>>(
      awxAPI`/instance_groups/?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.requestDelete(awxAPI`/instance_groups/${resource.id.toString()}/`, {
          failOnStatusCode: false,
        });
      }
    });
  });

  it('cleanup workflow approvals', () => {
    cy.requestGet<AwxItemsResponse<WorkflowApproval>>(
      awxAPI`/workflow_approvals/?name__startswith=E2E&page=1&page_size=200&created__lt=${twoHoursAgo}`
    ).then((result) => {
      for (const resource of result.results ?? []) {
        cy.requestPost(awxAPI`/workflow_approvals/${resource.id.toString()}/deny/`, {}, false);
        cy.requestDelete(awxAPI`/workflow_approvals/${resource.id.toString()}/`, {
          failOnStatusCode: false,
        });
      }
    });
  });
});
