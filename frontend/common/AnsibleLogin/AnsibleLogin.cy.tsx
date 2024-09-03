import { AnsibleLogin } from './AnsibleLogin';

describe('AnsibleLogin', () => {
  it('should render error message when auth_field url param present', () => {
    cy.mount(<AnsibleLogin loginApiUrl="/login" brandImgAlt="" onSuccess={() => {}} />, {
      path: '/',
      initialEntries: ['?auth_failed'],
    });

    cy.get('.pf-m-error').then((el) => {
      expect(el).to.contain('Unable to complete social auth login');
    });
  });
});
