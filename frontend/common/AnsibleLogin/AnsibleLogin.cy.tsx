import { AnsibleLogin } from './AnsibleLogin';

describe('AnsibleLogin', () => {
  it('should render error message when auth_field url param present', () => {
    cy.mount(
      <AnsibleLogin
        loginApiUrl="/login"
        authOptions={[{ login_url: 'bar', type: 'foo' }]}
        brandImgAlt=""
        onSuccess={() => {}}
        showLoginForm={true}
      />,
      {
        path: '/',
        initialEntries: ['?auth_failed'],
      }
    );

    cy.getByDataCy('social-error').then((el) => {
      expect(el).to.contain('Unable to complete social auth login');
    });
  });
});
