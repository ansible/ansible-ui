import { WorkflowOutput } from './WorkflowOutput';
import job from '../../../../../cypress/fixtures/workflow_job.json';
import workflowNodes from '../../../../../cypress/fixtures/workflow_nodes.json';
import { Job } from '../../../interfaces/Job';
describe('Workflow Output', () => {
  before(() => {
    cy.intercept(
      {
        method: 'GET',
        url: `/api/v2/workflow_jobs/126/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'workflow_job.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: `/api/v2/workflow_jobs/*/workflow_nodes/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'workflow_nodes.json',
      }
    );
  });
  it('should mount with correct number of nodes', () => {
    cy.mount(
      <WorkflowOutput
        job={job as unknown as Job}
        reloadJob={() => null}
        refreshNodeStatus={() => null}
      />
    );
    cy.get('g[data-kind="node"]').should('have.length', workflowNodes.results.length + 1); // The +1 accounts for the start node
  });
  it('should show status icon, and elapsed time label', () => {
    cy.mount(
      <WorkflowOutput
        job={job as unknown as Job}
        reloadJob={() => null}
        refreshNodeStatus={() => null}
      />
    );
    cy.get('g[data-type="failed-node"]').each((outterNode) => {
      cy.wrap(outterNode).within((node) => {
        cy.get('text').should('have.text', `${node.text()}`);
        cy.wrap(node).get('svg[data-cy="failed-icon"]').should('be.exist');
        return;
      });
    });
    cy.get('g[data-type="successful-node"]').each((node) => {
      cy.wrap(node).within((node) => {
        cy.get('svg[data-cy="successful-icon"]').should('be.exist');
        cy.get('text').should('have.text', `${node.text()}`);
      });
    });
  });
});
