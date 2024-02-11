import { CollectionImport, CollectionVersionSearch } from '../../collections/Collection';
import { HubImportLog } from './HubImportLog';

describe('HubImportLog.cy.tsx', () => {
  let collectionImportRunning: CollectionImport;
  let collectionImportCompleted: CollectionImport;
  let collectionImportFailed: CollectionImport;
  let collectionImportVeryLong: CollectionImport;

  let collectionApproved: CollectionVersionSearch;
  let collectionStaging: CollectionVersionSearch;
  let collectionRejected: CollectionVersionSearch;
  let collectionUnknown: CollectionVersionSearch;

  before(() => {
    cy.fixture('collection_version_pipelines').then(
      ({
        staging,
        approved,
        rejected,
        unknown,
      }: {
        staging: CollectionVersionSearch;
        approved: CollectionVersionSearch;
        rejected: CollectionVersionSearch;
        unknown: CollectionVersionSearch;
      }) => {
        collectionStaging = staging;
        collectionApproved = approved;
        collectionRejected = rejected;
        collectionUnknown = unknown;
      }
    );

    cy.fixture('collection_import').then(
      ({
        running,
        completed,
        failed,
        veryLongImport,
      }: {
        running: CollectionImport;
        completed: CollectionImport;
        failed: CollectionImport;
        veryLongImport: CollectionImport;
      }) => {
        collectionImportRunning = running;
        collectionImportCompleted = completed;
        collectionImportFailed = failed;
        collectionImportVeryLong = veryLongImport;
      }
    );
  });

  it('renders HubImportLog with no data', () => {
    cy.mount(<HubImportLog />);

    cy.contains('No data');
  });

  it('renders HubImportLog with collection Completed status and Approved approval status', () => {
    cy.mount(
      <HubImportLog collection={collectionApproved} collectionImport={collectionImportCompleted} />
    );
    cy.contains('Completed');
    cy.contains('Approved');
    cy.contains('1.0.0');

    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 18);
    cy.get('[data-cy="import-console-status-done"]').contains('Done');
  });

  it('renders HubImportLog with collection Completed status and Staging approval status', () => {
    cy.mount(
      <HubImportLog collection={collectionStaging} collectionImport={collectionImportCompleted} />
    );
    cy.contains('Completed');
    cy.contains('Waiting for approval');
    cy.contains('1.0.0');

    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 18);
    cy.get('[data-cy="import-console-status-done"]').contains('Done');
  });

  it('renders HubImportLog with collection Completed status and no pipeline', () => {
    cy.mount(
      <HubImportLog collection={collectionUnknown} collectionImport={collectionImportCompleted} />
    );
    cy.contains('Completed');
    cy.contains('could not be determined yet');
    cy.contains('1.0.0');

    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 18);
    cy.get('[data-cy="import-console-status-done"]').contains('Done');
  });

  it('renders HubImportLog with collection Completed status and Rejected approval status', () => {
    cy.mount(
      <HubImportLog collection={collectionRejected} collectionImport={collectionImportCompleted} />
    );
    cy.contains('Completed');
    cy.contains('Rejected');
    cy.contains('1.0.0');

    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 18);
    cy.get('[data-cy="import-console-status-done"]').contains('Done');
  });

  it('renders HubImportLog with collection Failed status', () => {
    cy.mount(<HubImportLog collection={undefined} collectionImport={collectionImportFailed} />);
    cy.contains('Failed');
    cy.contains('---');
    cy.contains('1.0.0');

    cy.contains(
      "Invalid collection metadata. 'name' has invalid format: testcollection_INVALID123"
    );
    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 2);

    cy.get('[data-cy="import-error"] button').click();
    cy.get('pre')
      .invoke('text')
      .then((text) => {
        expect(text.length).to.be.at.least(500);
      });

    cy.get('[data-cy="import-console-status-failed"]').contains('Failed');
  });

  it('renders HubImportLog with collection import Running status', () => {
    cy.mount(
      <HubImportLog collection={collectionApproved} collectionImport={collectionImportRunning} />
    );
    cy.contains('Running');
    cy.contains('waiting for import to finish');
    cy.contains('1.0.0');

    cy.get('[data-cy="import-console"]').children().find('div').should('have.length', 3);

    cy.get('[data-cy="import-console-status-done"]').should('not.exist');
    cy.get('[data-cy="import-console-status-failed"]').should('not.exist');
  });

  it('renders HubImportLog with with clickable navigation arrows', () => {
    cy.mount(
      <HubImportLog collection={collectionApproved} collectionImport={collectionImportVeryLong} />
    );

    cy.get('[data-cy="import-console"] [data-cy="navigation-arrow-up"]');
    cy.get('[data-cy="import-console"] [data-cy="navigation-arrow-down"]');
  });
});
