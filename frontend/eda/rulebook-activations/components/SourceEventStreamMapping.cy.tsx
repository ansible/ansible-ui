import { edaAPI } from '../../common/eda-utils';
import { SourceEventStreamMappingModal } from './SourceEventStreamMapping';

describe('SourceEventStreamMapping.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/rulebooks/1/sources/?page=1&page_size=200` },
      {
        count: 3,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: '__SOURCE_1',
            source_info: 'ansible.eda.sample1:\n  sample1: 10\n',
            rulebook_hash: 'hash_1',
          },
          {
            name: '__SOURCE_2',
            source_info: 'ansible.eda.sample2:\n  sample2: 10\n',
            rulebook_hash: 'hash_2',
          },
          {
            name: '__SOURCE_3',
            source_info: 'ansible.eda.sample3:\n  sample3: 10\n',
            rulebook_hash: 'hash_3',
          },
        ],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/*` },
      {
        fixture: 'edaEventStreams.json',
      }
    );
  });

  it('Renders the Event stream mapping modal', () => {
    cy.mount(
      <SourceEventStreamMappingModal
        rulebook={{
          id: 1,
          name: 'sample_rulebook.yml',
          description: '',
          rulesets:
            '---\n- name: Test run job templates\n  hosts: all\n  sources:\n    - ansible.eda.range:\n        limit: 10\n  rules:\n    - name: "1 job template"\n      condition: event.i >= 0\n      action:\n        run_job_template:\n          name: Demo Job Template\n          organization: Default\n          job_args:\n            extra_vars:\n              hello: Fred\n          retries: 1\n          delay: 10\n',
          project_id: 2,
          organization_id: 1,
          created_at: '2024-08-07T22:29:42.081976Z',
          modified_at: '2024-08-07T22:29:42.081983Z',
        }}
        mappings={undefined}
        setSourceMappings={() => undefined}
      />
    );
    cy.get('.pf-v5-c-modal-box__title-text').should('contain', 'Event streams');
    cy.contains(
      'Event streams represent server side webhooks which ease the routing issues related to running webhooks individually in a container or a pod. ' +
        'You can swap the sources in your rulebook with a matching event stream. Typically the sources to swap out are of the type ansible.eda.rulebook, ' +
        'but you may also be able to swap out your own webhook source plugins. The swapping process replaces just the source type and args and leaves your ' +
        'filters intact. We swap out the webhook source type with a source of type ansible.eda.pg_listener.'
    ).should('be.visible');
    cy.get('[data-cy="rulebook"]').should('contain.text', 'sample_rulebook.yml');
    cy.get('[data-cy="number-of-sources"]').should('contain.text', '3');
    cy.get('[data-cy="add_event_stream"]').should('contain.text', 'Add event stream');
    cy.clickButton(/^Add event stream$/);
    cy.get('[data-cy="mapping-header-0"]').should('contain.text', 'Mapping 1');
    cy.get('[data-cy="mappings-0-source-name"]').click();
    cy.get('#--source-1 > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('[data-cy="0-source-info"]').should(
      'contain.text',
      'ansible.eda.sample1:\n  sample1: 10\n'
    );
  });
});

describe('SourceEventStreamMapping.cy.ts with one source', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/rulebooks/1/sources/?page=1&page_size=200` },
      {
        count: 1,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: '__SOURCE_1',
            source_info: 'ansible.eda.sample1:\n  sample1: 10\n',
            rulebook_hash: 'hash_1',
          },
        ],
      }
    );
    cy.intercept(
      { method: 'GET', url: edaAPI`/event-streams/*` },
      {
        fixture: 'edaEventStreams.json',
      }
    );
  });

  it('The "Add event stream" button should not be present for only one source or only one event', () => {
    cy.mount(
      <SourceEventStreamMappingModal
        rulebook={{
          id: 1,
          name: 'sample_rulebook.yml',
          description: '',
          rulesets:
            '---\n- name: Test run job templates\n  hosts: all\n  sources:\n    - ansible.eda.range:\n        limit: 10\n  rules:\n    - name: "1 job template"\n      condition: event.i >= 0\n      action:\n        run_job_template:\n          name: Demo Job Template\n          organization: Default\n          job_args:\n            extra_vars:\n              hello: Fred\n          retries: 1\n          delay: 10\n',
          project_id: 2,
          organization_id: 1,
          created_at: '2024-08-07T22:29:42.081976Z',
          modified_at: '2024-08-07T22:29:42.081983Z',
        }}
        mappings={undefined}
        setSourceMappings={() => undefined}
      />
    );
    cy.get('[data-cy="rulebook"]').should('contain.text', 'sample_rulebook.yml');
    cy.get('[data-cy="number-of-sources"]').should('contain.text', '1');
    cy.get('[data-cy="add_event_stream"]').should('not.exist');
  });
});
