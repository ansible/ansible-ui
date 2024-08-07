// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Repository } from '../../../frontend/hub/administration/repositories/Repository';
import { Distribution } from '../../../frontend/hub/collections/UploadCollection';
import { HubNamespace } from '../../../frontend/hub/namespaces/HubNamespace';
import { Collections } from './constants';

describe('Collections Tabs: Distributions', () => {
  let namespace: HubNamespace;
  let repository: Repository;
  let collectionName: string;

  before(() => {
    cy.createHubNamespace().then((namespaceResult) => {
      namespace = namespaceResult;
      cy.uploadCollection(collectionName, namespace.name, '1.0.0');
      cy.approveCollection(collectionName, namespace.name, '1.0.0');
    });
    cy.createHubRepository().then((repositoryResult) => {
      repository = repositoryResult;
      cy.createHubRepositoryDistribution({
        distribution: { name: repository.name, repository: repository.pulp_href },
      });
    });
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
    cy.getByDataCy('table-view').click();
    cy.filterTableBySingleText(collectionName, true);
    cy.clickLink(collectionName);
    cy.verifyPageTitle(`${namespace.name}.${collectionName}`);
    cy.contains('Loading').should('not.exist');
  });

  after(() => {
    // TODO - this is another PR - cy.deletehubDistribution(repository.name);
    cy.deleteHubRepository(repository);
    cy.deleteHubCollectionByName(collectionName);
    cy.deleteHubNamespace(namespace);
  });

  it('can inspect distribution information from collection detail page', () => {
    //navigate to distributions tab
    cy.clickLink(/^Distributions$/);
    cy.requestGet<Distribution>(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call
      pulpAPI`/distributions/ansible/ansible/?repository=${repository.pulp_href}&ordering=name&offset=0&limit=10`
    ).then((res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(res.body.results.length).to.eq(1);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const distribution: Distribution = res.body.results[0];
      const { base_path, pulp_created, name, client_url } = distribution;

      // Set the variables
      cy.wrap(base_path).as('basePath');
      cy.wrap(pulp_created).as('pulpCreated');
      cy.wrap(name).as('distributionName');
      cy.wrap(client_url).as('clientUrl');
    });

    //on the distributions page, check the values
    cy.checkCellTextByColumnName('Name', '@name');
    cy.checkCellTextByColumnName('Base path', '@basePath');
    cy.checkCellTextByColumnName('Created', '@pulpCreated');
    cy.checkCellTextByColumnName('CLI Configuration', '@clientUrl');
  });
});
