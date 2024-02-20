import { NodeEditWizard } from './NodeEditWizard';
import { VisualizationProvider, BaseNode } from '@patternfly/react-topology';
import { awxAPI } from '../../../../common/api/awx-utils';

describe('NodeEditWizard', () => {
  describe('Prompted node', () => {
    const mockTemplate = {
      id: 100,
      name: 'Mock Job Template',
      description: 'Job Template Description',
      unified_job_type: 'job',
    };
    const mockTemplates = {
      count: 1,
      results: [mockTemplate],
    };
    const mockTemplateCredential = {
      id: 200,
      name: 'Template Mock Credential',
      credential_type: 2,
    };

    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
      cy.intercept('/api/v2/job_templates/100/launch/', {
        ask_credential_on_launch: true,
        defaults: {
          credentials: [
            {
              id: 200,
              name: 'Mock Credential',
              credential_type: 2,
            },
          ],
          job_tags: '',
          skip_tags: '',
        },
      });
      cy.intercept('/api/v2/job_templates/100/credentials/', {
        count: 1,
        results: [mockTemplateCredential],
      });
      cy.intercept('/api/v2/workflow_job_template_nodes/1/labels/', {
        count: 0,
        results: [],
      });
      cy.intercept('/api/v2/workflow_job_template_nodes/1/credentials/', {
        count: 0,
        results: [
          {
            id: 300,
            name: 'Node Mock Credential',
            credential_type: 2,
          },
        ],
      });
    });

    const mockNode = new BaseNode();
    mockNode.setId('1');
    mockNode.setData({
      resource: {
        id: 1,
        extra_data: {},
        identifier: 'mock_alias',
        type: 'workflow_job_template_node',
        all_parents_must_converge: true,
        summary_fields: {
          unified_job_template: mockTemplate,
        },
      },
      launch_data: {},
    });

    it('Should render the correct steps on initial ', () => {
      cy.mount(
        <VisualizationProvider>
          <NodeEditWizard node={mockNode} />
        </VisualizationProvider>
      );

      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 3);
        ['Node details', 'Prompts', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.get('[data-cy="node-type-form-group"]').within(() => {
        cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'Job Template');
      });
      cy.get('[data-cy="job-template-select-form-group"]').within(() => {
        cy.get('div.pf-v5-c-form__group-control').should('have.text', 'Mock Job Template');
      });
      cy.get('[data-cy="node-convergence-form-group"]').within(() => {
        cy.get('span.pf-v5-c-select__toggle-text').should('have.text', 'All');
      });
      cy.get('[data-cy="node-alias-form-group"]').within(() => {
        cy.get('input').should('have.value', 'mock_alias');
      });
    });
  });
});
