// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { HubRemote } from '../../../frontend/hub/administration/remotes/Remotes';
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { Distribution } from '../../../frontend/hub/collections/UploadCollection';
import { HubItemsResponse } from '../../../frontend/hub/common/useHubView';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { pulpAPI } from '../../support/formatApiPathForHub';
import { randomE2Ename } from '../../support/utils';
import { Collections } from './constants';

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
        repository: { remote: remote.pulp_href, retain_repo_versions: 2 },
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
    cy.deleteCollectionsInNamespace(namespace);
    cy.deleteHubNamespace({ ...namespace, failOnStatusCode: false });
  });

  beforeEach(() => {
    collectionName = randomE2Ename();
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });

  it('can inspect distribution information from collection detail page', () => {
    //navigate to distributions tab
    cy.uploadCollection(collectionName, namespace.name, '1.0.0');
    cy.approveCollection(collectionName, namespace.name, '1.0.0');
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
    cy.clickLink(/^Distributions$/);
    cy.requestGet<HubItemsResponse<Distribution>>(
      pulpAPI`/distributions/ansible/ansible/?repository=${repository.pulp_href}&ordering=name&offset=0&limit=10`
    ).then((data) => {
      expect(data?.results).to.have.length(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const distribution: Distribution = data.results[0];
      const { base_path, pulp_created, name, client_url } = distribution;
      cy.checkCellValueByColumnName('Name', name);
      cy.checkCellValueByColumnName('Base path', base_path);
      cy.checkCellValueByColumnName('Created', pulp_created);
      cy.checkCellValueByColumnName('CLI Configuration', client_url);
    });
  });
});
