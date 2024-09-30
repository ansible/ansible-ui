import { UpgradeUserType } from '../../support/constants';

/**
 * This file is only for verifying the test setup and demonstrating the use of the getUserForMigration command.
 * Once reviewed, we can delete this file.
 */
describe('Test upgrade test setup', () => {
  it('Test logging in with an unmigrated user from the list', () => {
    cy.getUserForMigration(UpgradeUserType.controllerLdap).then((user) => {
      expect(user.username).to.not.be.undefined;
      expect(user.password).to.not.be.undefined;
      cy.log('User credentials', user);
    });
  });
});
