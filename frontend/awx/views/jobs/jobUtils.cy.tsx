import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { UnifiedJob } from '../../interfaces/UnifiedJob';
import { getJobsAPIUrl, relaunchEndpoint } from './jobUtils';

describe('jobUtils', () => {
  it('Returns correct endpoint based on job type', () => {
    const endpoint = getJobsAPIUrl('workflow_job');
    expect(endpoint).to.equal(awxAPI`/workflow_jobs/`);
  });

  it('Returns correct relaunch endpoint based on job type', () => {
    cy.fixture('jobs.json').then((response: AwxItemsResponse<UnifiedJob>) => {
      const endpoint = relaunchEndpoint(response.results[0]);
      expect(endpoint).to.equal(awxAPI`/workflow_jobs/491/relaunch/`);
    });
  });
});
