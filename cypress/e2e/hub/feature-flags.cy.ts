import { AZURE_URL, SAAS_URL } from '../../support/constants';
import { hubAPI } from '../../support/formatApiPathForHub';

describe('Feature flags', () => {
  before(function () {
    cy.checkBuildType().then((buildType) => {
      if (buildType === SAAS_URL || buildType === AZURE_URL) {
        cy.log('Test/tests should not run on this deployment.');
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });
  it('match expectations', () => {
    cy.request(hubAPI`/_ui/v1/feature-flags/`).then(({ body }) => {
      expect(body).to.deep.include({ _messages: [] });
      expect(body).to.include({ ai_deny_index: false });
      expect(body).to.include({ can_create_signatures: true });
      expect(body).to.include({ can_upload_signatures: false });
      expect(body).to.include({ collection_signing: true });
      expect(body).to.include({ container_signing: true });
      expect(body).to.include({ display_repositories: true });
      expect(body).to.include({ display_signatures: true });
      expect(body).to.include({ execution_environments: true });
      expect(body).to.include({ legacy_roles: false });
      expect(body).to.include({ require_upload_signatures: false });
      expect(body).to.include({ signatures_enabled: true });
    });
  });
});
