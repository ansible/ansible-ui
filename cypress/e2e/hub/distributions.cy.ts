import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { Distribution } from '../../../frontend/hub/collections/UploadCollection';
import { PulpItemsResponse } from '../../../frontend/hub/common/useHubView';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections, Repositories } from './constants';

describe('Collections Tabs: Distributions', () => {
  let namespace: HubNamespace;
  let repository: Repository;
  let collectionName: string;
  let remote: HubRemote;

  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
    });
    cy.createHubRemote().then((remoteResult) => {
      remote = remoteResult;
      cy.createHubRepository({
        repository: { remote: remote.pulp_href, retain_repo_versions: 1 },
      }).then((repositoryResult) => {
        repository = repositoryResult;
        cy.createHubRepositoryDistribution({
          distribution: { name: repository.name, repository: repository.pulp_href },
        });
      });
    });
  });

  after(() => {
    cy.deleteHubRepositoryDistributionByName(repository.name);
    cy.deleteHubRepository(repository);
    cy.deleteHubRemote(remote);
    cy.deleteCollectionsInNamespace(namespace.name);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    collectionName = randomE2Ename();
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('can inspect distribution information from collection detail page', () => {
    cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle('Repositories');
    cy.clickTableRowLink('name', repository.name);
    cy.verifyPageTitle(repository.name);
    cy.clickTab('Collection Versions', true);
    cy.clickButton(/^Add collections$/);
    cy.getModal().within(() => {
      cy.filterTableByTextFilter('namespace', namespace.name);
      cy.selectTableRowByCheckbox('name', collectionName, { disableFilter: true });
      cy.contains('button', 'Select').click();
    });
    cy.getModal().should('not.exist');
    cy.setTableView('table');
    cy.getTableRow('name', collectionName, { disableFilter: true }).should('be.visible');
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.clickLink(/^Distributions$/);
    cy.requestGet<PulpItemsResponse<Distribution>>(
      pulpAPI`/distributions/ansible/ansible/?repository=${repository.pulp_href}&ordering=name&offset=0&limit=10`
    ).then((data) => {
      expect(data?.results).to.have.length(1);
      const distribution: Distribution = data.results[0];
      const { base_path, pulp_created, name } = distribution;
      const createdDate = new Date(pulp_created);
      const formattedDateTime = `${createdDate.toLocaleDateString()}, ${createdDate.toLocaleTimeString()}`;
      cy.checkValueByHeaderName('Name', name);
      cy.checkValueByHeaderName('Base path', base_path);
      cy.checkValueByHeaderName('Created', formattedDateTime);
      cy.get('button[aria-label="Copy to clipboard"]').click();
      cy.get('[data-cy="alert-toaster"]').should('be.visible');
      cy.get('[data-cy="alert-toaster"]').within(() => {
        cy.get('button').click();
      });
    });
  });
});
