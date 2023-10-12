/* eslint-disable i18next/no-literal-string */
import { PageForm } from '../PageForm';
import { PageFormDataEditor } from './PageFormDataEditor';

describe('PageFormCodeEditor', () => {
  interface CodeEditor {
    extra_vars: string;
  }

  let yamlContent = '';
  before(() => {
    cy.fixture('extra_vars.yaml').then((yaml: string) => {
      yamlContent = yaml;
    });
  });

  it('should mount properly', () => {
    cy.mount(
      <PageForm<CodeEditor>
        onSubmit={() => Promise.resolve()}
        onCancel={() => null}
        submitText="Submit"
        defaultValue={{ extra_vars: yamlContent }}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded={false}
          isExpandable
        />
      </PageForm>
    );
    expect(cy.get('label').contains('Extra Variables'));
    expect(cy.get('div#data-editor').should('not.exist'));
  });

  it('should mount expanded, upload, download, and copy button and 2 toggle language buttons', () => {
    cy.mount(
      <PageForm<CodeEditor>
        submitText="submit"
        onSubmit={() => Promise.resolve()}
        defaultValue={{ extra_vars: '' }}
        onCancel={() => null}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded
          toggleLanguages={['json', 'yaml']}
          isExpandable
        />
      </PageForm>
    );
    expect(cy.get('div#copy-button').should('be.visible'));
    expect(cy.get('div#upload-button').should('be.visible'));
    expect(cy.get('div#download-button').should('be.visible'));
    expect(cy.get('div#toggle-json').should('be.visible'));
    expect(cy.get('div#toggle-yaml').should('be.visible'));
    expect(cy.get('div#data-editor').should('be.visible'));
  });

  it('it should allow to upload a file', () => {
    cy.mount(
      <PageForm<CodeEditor>
        onSubmit={() => Promise.resolve()}
        onCancel={() => null}
        submitText="submit"
        defaultValue={{ extra_vars: '' }}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded
          toggleLanguages={['json', 'yaml']}
          isExpandable
        />
      </PageForm>
    );

    cy.fixture('extra_vars.yaml').as('yamlFixture');
    // because of input is hidden, we need to force
    cy.get('input[type="file"]')
      .selectFile('@yamlFixture', { force: true })
      .then(() => {
        cy.get('#data-editor').find('textarea').should('have.value', yamlContent);
      });
  });

  it('it should allow to drag a file', () => {
    cy.mount(
      <PageForm<CodeEditor>
        onSubmit={() => Promise.resolve()}
        onCancel={() => null}
        submitText="submit"
        defaultValue={{ extra_vars: '' }}
      >
        <PageFormDataEditor
          label="Extra Variables"
          name="extra_vars"
          defaultExpanded
          toggleLanguages={['json', 'yaml']}
          isExpandable
        />
      </PageForm>
    );

    cy.fixture('extra_vars.yaml').as('yamlFixture');
    // because of input is hidden, we need to force
    cy.get('input[type="file"]')
      .selectFile('@yamlFixture', { force: true, action: 'drag-drop' })
      .then(() => {
        cy.get('#data-editor').find('textarea').should('have.value', yamlContent);
      });
  });

  // RANDOM FAILING TEST
  // > Uncaught NetworkError: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'http://localhost:8080/__cypress/src/vendors-node_modules_yaml_browser_index_js.js' failed to load.
  //
  // it('Invalid syntax should make toggle language buttons disabled', () => {
  //   cy.mount(
  //     <PageForm<CodeEditor>
  //       onSubmit={() => Promise.resolve()}
  //       onCancel={() => null}
  //       submitText="submit"
  //       defaultValue={{
  //         extra_vars:
  //           'playing_song_artist: Playing song, {{ song_name }} by {{ artist }}playing_playlist: {{ action }} playlist {{ playlist_name }}',
  //       }}
  //     >
  //       <PageFormDataEditor
  //         label="Extra Variables"
  //         name="extra_vars"
  //         defaultExpanded
  //         toggleLanguages={['json', 'yaml']}
  //         isExpandable
  //       />
  //     </PageForm>
  //   );
  //   cy.get('div#toggle-json').get('button.pf-v5-c-toggle-group__button').should('be.disabled');
  //   cy.get('div#toggle-yaml').get('button.pf-v5-c-toggle-group__button').should('be.disabled');
  // });
});
