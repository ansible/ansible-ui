import { awxAPI } from '../../../awx/common/api/awx-utils';
import { OrgRolesList } from './OrgRolesList';

describe('OrgRolesList', () => {
  const orgListProps = {
    title: 'Automation controller roles',
    isExpandable: true,
    apiPrefixFunction: awxAPI,
    orgId: '245',
    userId: '93',
    listId: 1,
    setOrgListIsEmpty: () => {},
  };
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/role_user_assignments/?user_id=93&object_id=245*`,
      },
      {
        fixture: 'awxUserOrgRoleAssignments.json',
      }
    );
  });
  it('Renders list of organization roles for a user', () => {
    cy.mount(<OrgRolesList {...orgListProps} />);
    cy.get('table tbody').find('tr').should('have.length', 1);
    cy.contains('Organization Project Admin');
  });
  it('Renders the correct columns', () => {
    cy.mount(<OrgRolesList {...orgListProps} />);
    cy.get('.pf-v5-c-table__th').should('have.length', 2);
    cy.contains('th', 'Name');
    cy.contains('th', 'Description');
  });
  it('Renders expandable list', () => {
    cy.mount(<OrgRolesList {...orgListProps} />);
    cy.get('button.pf-v5-c-expandable-section__toggle').should('be.visible');
    cy.contains('Organization Project Admin').should('be.visible');
    cy.get('button.pf-v5-c-expandable-section__toggle').click();
    cy.contains('Organization Project Admin').should('not.be.visible');
  });
  it('Renders non-expandable list', () => {
    cy.mount(<OrgRolesList {...{ ...orgListProps, isExpandable: false }} />);
    cy.get('button.pf-v5-c-expandable-section__toggle').should('not.exist');
    cy.contains('Organization Project Admin').should('be.visible');
  });
});
