import { AwxItemsResponse } from '../../../../frontend/awx/common/AwxItemsResponse';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Job } from '../../../../frontend/awx/interfaces/Job';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { WorkflowApproval } from '../../../../frontend/awx/interfaces/WorkflowApproval';
import { getJobsAPIUrl } from '../../../../frontend/awx/views/jobs/jobUtils';
import { cyLabel } from '../../../support/cyLabel';
import { awxAPI } from '../../../support/formatApiPathForAwx';

const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

cyLabel(['upstream'], () => {
  describe('AWX Cleanup', () => {
    it('cleanup projects', () => {
      cy.requestGet<AwxItemsResponse<Project>>(
        awxAPI`/projects?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          cy.deleteAwxProject(resource, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup inventories', () => {
      cy.requestGet<AwxItemsResponse<Inventory>>(
        awxAPI`/inventories?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          cy.deleteAwxInventory(resource, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup organizations', () => {
      cy.requestGet<AwxItemsResponse<Organization>>(
        awxAPI`/organizations?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          cy.deleteAwxOrganization(resource, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup users', () => {
      cy.requestGet<AwxItemsResponse<AwxUser>>(
        awxAPI`/users?username__startswith=e2e-&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          cy.deleteAwxUser(resource, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup templates', () => {
      cy.requestGet<AwxItemsResponse<JobTemplate>>(
        awxAPI`/unified_job_templates/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          cy.deleteAwxJobTemplate(resource, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup jobs', () => {
      cy.requestGet<AwxItemsResponse<Job>>(
        awxAPI`/unified_jobs/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
      ).then((result) => {
        for (const resource of result.results ?? []) {
          const url = getJobsAPIUrl(resource.job_type ?? '');
          cy.requestDelete(`${url}${resource.id}/`, { failOnStatusCode: false });
        }
      });
    });

    it('cleanup instance groups', () => {
      cy.requestGet<AwxItemsResponse<Job>>(
        awxAPI`/instance_groups/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
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
        awxAPI`/workflow_approvals/?name__startswith=E2E&page=1&page_size=200&created__lt=${tenMinutesAgo}`
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
});
