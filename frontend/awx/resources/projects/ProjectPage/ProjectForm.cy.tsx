import { RouteObj } from '../../../../Routes';
import * as useOptions from '../../../../common/crud/useOptions';
import * as useAwxConfig from '../../../common/useAwxConfig';
import { CreateProject, EditProject } from './ProjectForm';

describe('ProjectForm.cy.ts', () => {
  beforeEach(() => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          GET: {
            scm_type: {
              type: 'choice',
              label: 'SCM Type',
              help_text: 'Specifies the source control system used to store the project.',
              filterable: true,
              choices: [
                ['', 'Manual'],
                ['git', 'Git'],
                ['svn', 'Subversion'],
                ['insights', 'Red Hat Insights'],
                ['archive', 'Remote Archive'],
              ],
            },
          },
        },
      },
    }));
    cy.stub(useAwxConfig, 'useAwxConfig').callsFake(() => null);
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      { fixture: 'organizations.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/credential_types/*' },
      { fixture: 'credential_types.json' }
    );
    cy.intercept({ method: 'GET', url: '/api/v2/projects/*' }, { fixture: 'project.json' });
  });
  describe('validates fields', () => {
    it('validates initial required fields', () => {
      cy.mount(<CreateProject />);
      cy.clickButton(/^Create project$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Organization is required.').should('be.visible');
      cy.contains('Source control type is required.').should('be.visible');
      cy.hasTitle(/^Create Project$/);
    });
    it('validates required field for source control types', () => {
      cy.mount(<CreateProject />);
      cy.typeInputByLabel(/^Name$/, 'Test Project');
      cy.selectDropdownOptionByLabel(/^Organization$/, 'Default');
      // Git
      cy.selectDropdownOptionByLabel(/^Source Control Type$/, 'Git');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');
      // Insights
      cy.selectDropdownOptionByLabel(/^Source Control Type$/, 'Red Hat Insights');
      cy.clickButton(/^Create project$/);
      cy.contains('Insights credential is required.').should('be.visible');
      // Remote Archive
      cy.selectDropdownOptionByLabel(/^Source Control Type$/, 'Remote Archive');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');
      // SVN
      cy.selectDropdownOptionByLabel(/^Source Control Type$/, 'Subversion');
      cy.clickButton(/^Create project$/);
      cy.contains('Source control url is required.').should('be.visible');
    });
    it('validates content signature validation credential', () => {
      cy.intercept(
        { method: 'GET', url: 'api/v2/credentials/?name=*' },
        {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }
      );
      cy.mount(<EditProject />, {
        path: RouteObj.EditProject,
        initialEntries: [RouteObj.EditProject.replace(':id', '9')],
      });
      cy.typeInputByLabel(/^Content Signature Validation Credential$/, 'XYZ');
      cy.clickButton(/^Save project$/);
      cy.contains('Credential not found.').should('be.visible');
      cy.hasTitle(/^Edit Project$/);
    });
    it('validates source control credential', () => {
      cy.intercept(
        { method: 'GET', url: 'api/v2/credentials/?name=*' },
        {
          count: 0,
          next: null,
          previous: null,
          results: [],
        }
      );
      cy.mount(<EditProject />, {
        path: RouteObj.EditProject,
        initialEntries: [RouteObj.EditProject.replace(':id', '9')],
      });
      // Incorrect credential
      cy.typeInputByLabel(/^Source Control Credential$/, 'XYZ');
      cy.clickButton(/^Save project$/);
      cy.contains('Credential not found.').should('be.visible');
      cy.hasTitle(/^Edit Project$/);
    });
  });
  it('displays warning if there are no available playbook directories (Manual source control type)', () => {
    cy.mount(<CreateProject />);
    cy.typeInputByLabel(/^Name$/, 'Test Project');
    cy.selectDropdownOptionByLabel(/^Organization$/, 'Default');
    cy.selectDropdownOptionByLabel(/^Source Control Type$/, 'Manual');
    cy.contains('WARNING:').should('be.visible');
    cy.contains('There are no available playbook directories').should('be.visible');
  });
});
