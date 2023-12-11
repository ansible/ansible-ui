import { randomString } from '../../../framework/utils/random-string';
import { Collections } from './constants';

describe('Collections- List View', () => {
  //Important to know:
  //**In order to upload a collection, a namespace must first exist containing the first word of the collection file name
  //**The only way to get rid of a collection's artifact is to choose the following opt: Delete entire collection from repository
  //
  before(() => {
    const namespaceName = 'E2E Namespace ' + randomString(4);
    cy.hubLogin();
    cy.createNamespace(namespaceName);
  });

  it('it should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it.skip('user can upload a new collection', () => {});

  it.skip('user can delete a collection using the list toolbar', () => {});

  it.skip('user can delete selected entire collections from repository using the list toolbar', () => {});

  it.skip('user can deprecate selected collections using the list toolbar', () => {});
});

describe('Collections List- Line Item Kebab Menu', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

  it.skip('user can deprecate a collection', () => {});

  it.skip('user can copy a version to repository', () => {});
});

describe('Collections Details View', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can upload a new version to an existing collection', () => {});

  it.skip('user can delete entire collection from system', () => {});

  it.skip('user can delete entire collection from repository', () => {});

  it.skip('user can deprecate a collection', () => {});

  it.skip('user can delete version from system', () => {});

  it.skip('user can delete version from repository', () => {});

  it.skip('user can copy a version to repository', () => {});

  it.skip('user can access the Install tab and download a tarball', () => {});
});

describe('Collection Approvals List', () => {
  before(() => {
    cy.hubLogin();
  });

  it.skip('user can approve a collection', () => {});

  it.skip('user can reject a collection', () => {});

  it.skip('user can upload a signature to a collection', () => {});
});
